# Arquitectura Fase 1 — Integración Supabase + Cloudflare Workers

> Decisiones confirmadas en conversación con el dueño del proyecto al 2026-10-27.
> Las decisiones marcadas **[CONFIRMADO]** no se renegocian: guían las migraciones
> y el código que se implementará a partir de este documento.
> Este documento **no reemplaza** la auditoría general en `docs/audit/analisis-fase-1.md`.

## 1. Alcance de la fase

Convertir la V2 (catálogo de demostración, desplegable en Cloudflare Workers) en
una plataforma real con Supabase: catálogo público, búsqueda, fichas de obra y
arreglos, almacenamiento de PDF con control editorial, usuarios, favoritos,
aportes y panel administrativo.

**Fuera de alcance de esta fase (decisión propia del dueño):**
- Aportes de usuarios con flujo de revisión editorial → **versión futura**
  (no se implementará el módulo `contributions` ahora; el modelo queda descrito
  para que la migración posterior no rompa lo que exista).
- Visor embebido PDF.js → fase posterior. Los PDF se abren en pestaña nueva y
  permiten descarga.
- Roles adicionales a `admin`/`editor` (colaborador, revisor, etc.) → agregables
  después sin cambios de modelo.

## 2. Jerarquía musical

```
Obra (work)
  └── Arreglo / versión (arrangement) — formación, tonalidad, versión
        └── Archivo de partitura (score_file) — 1..n PDFs por arreglo
```

- El catálogo público navega por **obra**; los arreglos se listan dentro de la
  ficha; los archivos se habilitan por arreglo.
- Un usuario debe poder encontrar obras **sin conocer previamente la
  colección**: la búsqueda y los filtros de colección deben funcionar a nivel
  de obra.

## 3. Colecciones: justificación de la doble relación **[CONFIRMADO]**

Las cuatro colecciones iniciales son: **Coro Nacional, Coros Unidos, Coros
Polifónicos e Himnarios Tradicionales** (seed). Se mantienen **ambas** tablas
puente:

| Tabla | Significado | Ejemplo de uso |
|---|---|---|
| `collections_works` | La **obra** pertenece a la colección, con independencia del arreglo | *Himnarios Tradicionales*: himnarios son un repertorio, no una versión |
| `collections_arrangements` | Un **arreglo específico** pertenece a la colección | *Coro Nacional / Coros Unidos / Coros Polifónicos*: definen qué versiones (formaciones) se cantan en esos encuentros; un mismo himnario aporta versiones distintas |

Regla pública de pertenencia: una obra aparece como parte de una colección si
está en `collections_works` **o** alguno de sus arreglos publicados está en
`collections_arrangements`. La ficha de colección destaca las versiones
coincidentes (la V2 ya muestra `matchingArrangements` en la página de
colección — `src/app/colecciones/[slug]/page.tsx`).

Ambas tablas puentes llevan `(collection_id, work_id/arrangement_id)` único y
RLS de solo lectura para el público.

## 4. Modelo de datos (schema `public`)

```mermaid
erDiagram
    auth_users ||--o| profiles : "id FK 1:1"
    auth_users ||--o{ user_roles : "tiene"
    roles ||--o{ user_roles : "define"
    auth_users ||--o{ favorites : "marca"
    auth_users ||--o{ audit_log : "actúa"
    works ||--o{ arrangements : "tiene"
    works ||--o{ favorites : "favorecida"
    collections ||--o{ collections_works : ""
    works ||--o{ collections_works : ""
    collections ||--o{ collections_arrangements : ""
    arrangements ||--o{ collections_arrangements : ""
    arrangements ||--o{ score_files : "1..n PDFs"
    score_files ||--o| score_files : "previous_file_id"
    score_files }o--o{ audit_log : "sujeto de"

    profiles { uuid id FK display_name user_type choir_or_institution city }
    roles { text name PK }
    user_roles { uuid user_id PKFK text role PKFK uuid granted_by timestamptz granted_at }
    collections { uuid id PK slug UQ name kicker short_description full_description display_order is_published }
    works { uuid id PK slug UQ title subtitle composer lyricist original_language historical_notes is_published created_at updated_at }
    arrangements { uuid id PK work_id FK title arranger voicing accompaniment_type tonality meter tempo difficulty duration_seconds is_published }
    score_files { uuid id PK arrangement_id FK file_type label storage_path original_filename file_size_bytes sha256_hash page_count availability is_publicly_downloadable previous_file_id uploaded_by uploaded_at replaced_by replaced_at replaced_at_reason }
    favorites { uuid user_id PKFK uuid work_id PKFK created_at }
    audit_log { uuid id PK actor_id action entity_type entity_id details JSONB occurred_at }
```

Referencia directa: `supabase/migrations_clean` del proyecto original
(roles/bootstrap = 001; catálogo = 002; archivos = 004; storage = 007).

### Entidades y decisiones

**`roles` / `user_roles` — [CONFIRMADO] roles iniciales `admin` y `editor`.**
`is_admin()` / `is_editor_or_admin()` como funciones `SECURITY DEFINER` con
`SET search_path = public` fijo. El primer `admin` se asigna una única vez vía
`bootstrap_claim_initial_admin()` (guarded con `SELECT ... FOR UPDATE` y
condición "cero admins"), anulando carreras y la autopromoción: **ninguna**
política concederá INSERT/UPDATE en `user_roles` a otro admin salvo mediante esa
función.

**`works`**: `slug` único, metadatos de la V2 (`composer`, `lyricist`,
`original_language`, `historical_notes`), `is_published` + timestamps.
**`arrangements`**: los metadatos del tipo `Arrangement` de la V2
(`voicing`, `accompaniment_type`, `tonality`, `meter`, `tempo`, `difficulty`,
`duration_seconds` — ya en formato de duración numérica, más fácil de filtrar
que el `3:15` en texto de la demo), más `is_published`.

**`score_files` — [CONFIRMADO] requisitos explícitos:**

| Requisito | Columna mecánica |
|---|---|
| Identificador y metadatos | `id`, `label`, `file_type`, `original_filename`, `file_size_bytes`, `page_count` |
| Asociación al arreglo | `arrangement_id` FK |
| Integridad | `sha256_hash` (UNIQUE por arreglo) |
| Estado editorial y restricciones | `availability` ∈ `pending/approved/withdrawn/replaced`, `is_publicly_downloadable` |
| Reemplazo encadenado | `previous_file_id` FK auto-referencial + triggers anti-ciclo y anti-bifurcación (sin romper el histórico) |
| Quién y cuándo | `uploaded_by`/`uploaded_at` para el alta; `replaced_by`/`replaced_at` al reemplazar una versión |
| Visibilidad histórica | el público **solo** ve `availability = 'approved'` **y** `is_publicly_downloadable = true`. `pending`, `withdrawn`, `replaced` y archivos restringidos quedan fuera de campo |
| Depósito | `uploaded_by` referencia `auth.users` y queda registrado en `audit_log` también |

**`favorites`**: nivel obra (usuario puede querer almacenar para volver a
buscar). UNIQUE `(user_id, work_id)`. No se permite a un favorito vincular un
arreglo en esta fase.

**`audit_log` — [CONFIRMADO] el cliente no puede escribir directamente:**
`actor_id`, `action`, `entity_type`, `entity_id`, `details JSONB`,
`occurred_at`. Sin políticas de INSERT/UPDATE/DELETE para `anon`/`authenticated`;
escritura **solo** mediante RPCs `SECURITY DEFINER`, siempre en la **misma
transacción** que la mutación crítica (aprobación, retiro, reemplazo,
asignación de rol) → imposibilidad de inconsistencias parciales: si falla la
mutación, no se registra la auditoría; si falla la auditoría, se revierte la
mutación. Lectura: exclusiva `admin`.

## 5. Matriz de permisos (RLS)

| Operación | anon (visitante) | authenticated | editor | admin |
|---|---|---|---|---|
| Leer catálogo/colecciones/archivos publicados | ✔ | ✔ | ✔ | ✔ |
| Descargar PDF públicos (aprobado + autorizado) | ✔ | ✔ | ✔ | ✔ |
| Descargar PDF restringidos/retirados | ✖ | ✖ | ✔ | ✔ |
| Favoritos propios | ✖ | ✔ (solo los suyos) | ✔ | ✔ |
| Crear/ajustar favoritos ajenos / leer los de otros | ✖ | ✖ | ✖ | ✖ |
| Escribir en staging `staging/{auth.uid()}/` | ✖ | ✔ | ✔ | ✔ |
| Leer staging ajeno | ✖ | ✖ | ✔ | ✔ |
| Publicar / aprobar / retirar / reemplazar PDFs | ✖ | ✖ | via RPC | via RPC |
| Editar catálogo (works/arrangements/collections) | ✖ | ✖ | ✔ | ✔ || Ver `audit_log` | ✖ | ✖ | ✖ | via RPC |
| Asignar/quitar roles (`user_roles`) | ✖ | ✖ | ✖ | ✖ para clientes; solo bootstrap/ RPCs |
| Autopromoción a admin | ✖ | ✖ | ✖ | solo una vez, vía `bootstrap_claim_initial_admin()` |

Principios RLS: RLS habilitado en **todas** las tablas desde la primera
migración; ninguna política con `USING (true)`; el `service_role` usará
únicamente código server-side canalizado por RPCs, no acceso directo desde el
navegador.

## 6. Storage de PDFs

- **Un bucket, privado**: `score-files` (25 MB, `application/pdf`).
- **Escritura de usuario**: solo `staging/{auth.uid()}/{uuid}.pdf` (2 niveles
  exactos, bloqueo de subcarpetas — corrección VULN-03 del original).
- **Ruta canónica** (lectura): definida en migración, p. ej.
  `works/{work_id}/{arrangement_id}/{score_file_id}.pdf`. Escribible **solo**
  vía RPC `SECURITY DEFINER` con service_role; nunca desde el cliente.
- **Descarga pública** solo si `availability='approved'` **y**
  `is_publicly_downloadable=true` → URL firmada con TTL 900 s emitida
  en server-side (RPC `verify_score_file_access`), nunca URL pública directa.
- **Validación**: tamaño + magic bytes `%PDF-` (cabecera y cola) + SHA-256 al
  momento de aprobar. Un archivo `pending/restricted/withdrawn` **nunca**
  genera URL firmada pública.
- `Content-Disposition: inline` al abrir (pestaña nueva); descarga permitida
  por el propio archivo — decisión confirmada.

## 7. Variables de entorno y secretos

| Variable | Público | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | sí (browser) | cliente anon |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sí (browser) | cliente anon con RLS como única barrera |
| `NEXT_PUBLIC_SITE_URL` | sí (build) | metadataBase/canónica/sitemap |
| `SUPABASE_SERVICE_ROLE_KEY` | **NUNCA en cliente, nunca en repo, nunca como variables `NEXT_PUBLIC_*` ni variables de build visibles** | client admin server-side vía OpenNext, solo en Worker con datos encryptos de Cloudflare |
| Supabase JWT secret, SMTP, DB password | nunca en el proyecto | Supabase dashboard |

Sin `.env` en el repo (ya en `.gitignore`). Los pasos de despliegue en
Cloudflare deben inyectar la `service_role` vía *secretos* del Worker
(después de la fase 1), nunca como Build Variables.

## 8. Páginas `/acerca-de` y `/changelog` — [CONFIRMADO]

Ambas serán rutas App Router estáticas (SSG), sin Supabase, con contenido
mantenido en el código, enlazadas desde el footer
(`src/components/site-footer.tsx`):

### `/acerca-de` — `src/app/acerca-de/page.tsx`
Contenido mínimo acordado:
- Propósito: biblioteca digital de partituras cristianas para coros y
  ministerios musicales de Chile.
- Créditos, sin títulos profesionales inventados ni colaboradores ficticios:
  - Creador y desarrollador: **Joaquín Herrera**.
  - Correo: `joaquinherrera.dev@gmail.com`.
  - Instagram: `https://www.instagram.com/joaaaakohh/`.
- Metadatos con el template existente (`%s · Partituras Cristianas Chile`).

### `/changelog` — `src/app/changelog/page.tsx`
Datos desde `src/data/changelog.ts` (versionado con el código, no en
Supabase). **Primera entrada única que refleje el estado verificable real,
sin historial ficticio**:

- `v0.1.0` — 2026-10-27 (fecha del estado verificado en
  `docs/audit/analisis-fase-1.md`: lint/typecheck/test/build en verde,
  humo en workerd).
  - Primera versión de la V2: catálogo de demostración, inicio editorial,
    colecciones, fichas de obra, búsqueda/filtros, responsive, SEO básico.
  - Catálogo sin datos reales; sin descargas, auth, panel ni Supabase.
  - Preparado para Cloudflare Workers (OpenNext); sin publicar públicamente.

Reglas: cada versión futura se agrega arriba manualmente al desplegar; nunca
inventar versiones/fechas/cambios no documentados.

## 9. Renderizado de rutas integradas a Supabase

Dado que `open-next.config.ts` se mantiene **sin caché incremental** (sin R2):

| Ruta | Render tras integración | Motivo |
|---|---|---|
| `/` | Dinámico SSR (o SSG con `revalidate` si aparecen datos estables) | destacados desde BD |
| `/catalogo` | Dinámico (ya lo es) | búsqueda por query params |
| `/obras/[id]` y `/colecciones/[slug]` | **Dinámico SSR** con derivación explícita (`dynamicParams` y sin `generateStaticParams` de BD) | evita depender de ISR/R2 en esta fase y refleja cambios editoriales al instante |
| `/acerca-de`, `/changelog` | Estático | contenido en código |

Decisión deliberada: aceptar SSR por petición en detalle de obra/colección
(cargo de lectura por fila es ínfimo; las tablas son índices por slug) y
posponer cualquier caché incremental/R2 a una fase de rendimiento medida.
