-- Baja el límite de PDFs a 10 MB para que las subidas entren en Cloudflare
-- Workers Free. Ejecutar después de 0001_donko_library.sql.
--
-- Antes de aplicarla, comprueba que no haya archivos mayores:
--   select count(*) from public.scores where file_size_bytes > 10485760;
--
-- Si hay filas mayores, la migración fallará y no cambiará nada.

begin;

do $$
declare
    constraint_name text;
begin
    for constraint_name in
        select conname
        from pg_constraint
        where conrelid = 'public.scores'::regclass
          and contype = 'c'
          and pg_get_constraintdef(oid) like '%file_size_bytes%'
    loop
        execute format('alter table public.scores drop constraint %I', constraint_name);
    end loop;
end;
$$;

alter table public.scores
    add constraint scores_file_size_bytes_max
    check (file_size_bytes > 0 and file_size_bytes <= 10485760);

update storage.buckets
set file_size_limit = 10485760
where id = 'score-files';

commit;
