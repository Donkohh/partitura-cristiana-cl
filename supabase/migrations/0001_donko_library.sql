-- ============================================================================
-- DONKO PARTITURAS - esquema inicial
-- ============================================================================
-- Instalación limpia: biblioteca personal de PDF con carpetas administradas.
-- No hay usuarios públicos, obras, arreglos, colecciones, favoritos ni roles.
-- Las escrituras se ejecutan exclusivamente en el servidor con service_role
-- después de validar la sesión del administrador único.
-- ============================================================================

begin;

create extension if not exists pgcrypto;
create extension if not exists unaccent;

create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql set search_path = public, pg_temp;

-- Carpetas --------------------------------------------------------------------
create table public.folders (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(btrim(name)) between 1 and 80),
    -- Nombre plegado (minúsculas, sin tildes, espacios colapsados). UNIQUE evita
    -- duplicados por diferencias triviales de mayúsculas o espacios.
    normalized_name text not null unique
        check (char_length(btrim(normalized_name)) between 1 and 80),
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

create trigger trg_folders_updated_at
    before update on public.folders
    for each row execute function public.handle_updated_at();

-- Partituras ------------------------------------------------------------------
create table public.scores (
    id uuid primary key default gen_random_uuid(),
    title text not null check (char_length(btrim(title)) between 1 and 160),
    original_filename text not null
        check (char_length(btrim(original_filename)) between 1 and 255),
    folder_id uuid references public.folders(id) on delete set null,
    -- Ruta interna opaca: nunca se deriva del nombre original del archivo.
    storage_path text not null unique check (
        storage_path ~
        '^scores/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.]pdf$'
    ),
    file_size_bytes bigint not null
        check (file_size_bytes > 0 and file_size_bytes <= 26214400),
    sha256_hash text not null check (sha256_hash ~ '^[0-9a-f]{64}$'),
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

create trigger trg_scores_updated_at
    before update on public.scores
    for each row execute function public.handle_updated_at();

create index idx_scores_folder_id on public.scores(folder_id);
create index idx_scores_title on public.scores(title);

-- Acceso público de solo lectura ---------------------------------------------
-- Se habilitan RLS y privilegios por columna: anon/authenticated solo pueden
-- leer los metadatos públicos. storage_path, sha256_hash y el resto quedan
-- fuera de su alcance. No existe ninguna política de escritura para clientes.
alter table public.folders enable row level security;
alter table public.scores enable row level security;

revoke all on public.folders from public;
revoke all on public.folders from anon, authenticated;
revoke all on public.scores from public;
revoke all on public.scores from anon, authenticated;

grant select (id, name, created_at, updated_at)
    on public.folders to anon, authenticated;
grant select (
    id, title, original_filename, folder_id, file_size_bytes, created_at, updated_at
) on public.scores to anon, authenticated;

create policy "folders_select_public"
    on public.folders for select
    to anon, authenticated
    using (true);

create policy "scores_select_public"
    on public.scores for select
    to anon, authenticated
    using (true);

-- Borrado de carpeta atómico --------------------------------------------------
-- Si contiene partituras exige p_move_scores = true; en ese caso las mueve a
-- «Sin carpeta» y recién después elimina la carpeta. Nunca borra PDFs.
create or replace function public.delete_library_folder(
    p_folder_id uuid,
    p_move_scores boolean default false
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_count integer;
begin
    perform 1 from public.folders where id = p_folder_id for update;

    if not found then
        raise exception 'FOLDER_NOT_FOUND';
    end if;

    select count(*) into v_count
    from public.scores
    where folder_id = p_folder_id;

    if v_count > 0 and not p_move_scores then
        raise exception 'FOLDER_NOT_EMPTY';
    end if;

    update public.scores
    set folder_id = null
    where folder_id = p_folder_id;

    delete from public.folders where id = p_folder_id;

    return v_count;
end;
$$;

revoke all on function public.delete_library_folder(uuid, boolean) from public;
revoke all on function public.delete_library_folder(uuid, boolean) from anon, authenticated;
grant execute on function public.delete_library_folder(uuid, boolean) to service_role;

-- Storage privado -------------------------------------------------------------
-- Bucket privado de 25 MB. Sin políticas para anon/authenticated: los objetos
-- solo se leen/escriben desde Server Actions y Route Handlers con service_role.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'score-files',
    'score-files',
    false,
    26214400,
    array['application/pdf']::text[]
)
on conflict (id) do update set
    public = false,
    file_size_limit = 26214400,
    allowed_mime_types = array['application/pdf']::text[];

commit;
