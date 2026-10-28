# Análisis Fase 1 — V2 Partituras Cristianas Chile

> Registro del análisis realizado el 2026-10-27, antes de la integración de
> Supabase. Solo lectura y verificación: no se modificó código ni infraestructura.

## 1. Estado de la V2 al momento del análisis

### Stack y despliegue

| Componente | Versión / decisión |
|---|---|
| Next.js | 16.4.3 (App Router, Turbopack) |
| React | 19.3.0 |
| TypeScript | 5.x |
| Tailwind | 4.x |
| Despliegue objetivo | Cloudflare **Workers** con `@opennextjs/cloudflare` 1.20.13 + `wrangler` 4.154.0 |
| `cacheComponents` / PPR | **Desactivado** en `next.config.ts` (staged rendering incompatible con workerd en adaptador 1.20.x) |
| Imágenes | `unoptimized: true` (el binding `IMAGES` de Cloudflare es de pago; fotos locales) |
| Git | **El proyecto no es un repositorio Git** |

Verificación ejecutada y en verde: `lint`, `typecheck`, `test` (13/13), `next build`,
`opennextjs-cloudflare build` y humo end-to-end en workerd (`npm run preview`):
todas las rutas 200, 404 correcto, robots.txt y sitemap.xml servidos.

### Rutas existentes

| Ruta | Archivo | Render |
|---|---|---|
| `/` | `src/app/page.tsx` | Estático (SSG) |
| `/catalogo` | `src/app/catalogo/page.tsx` | Dinámico (`await searchParams`: `q`, `voz`, `coleccion`) |
| `/colecciones` | `src/app/colecciones/page.tsx` | Estático |
| `/colecciones/[slug]` | `src/app/colecciones/[slug]/page.tsx` | Estático (`generateStaticParams`) |
| `/obras/[id]` | `src/app/obras/[id]/page.tsx` | Estático (`generateStaticParams`) |
| `/_not-found` | `src/app/not-found.tsx` | Estático |
| `/robots.txt` | `src/app/robots.ts` | Estático |
| `/sitemap.xml` | `src/app/sitemap.ts` | Estático |
| Admin | **no existe** | — |

### Capa de datos y componentes

- Datos de demostración en `src/data/demo-catalog.ts` (10 obras, 23 arreglos,
  4 colecciones). Etiquetados como "Edición de demostración" en catálogo, ficha
  y footer.
- Tipos en `src/types/music.ts`: `Work`, `Collection`, `Arrangement`.
  **No existe entidad Archivo/ScoreFile**; un arreglo aún no puede tener archivos.
- Búsqueda pura y testeable en `src/lib/catalog-search.ts` (normalización sin
  tildes, sanitización, scoring). Directamente reutilizable contra Supabase.
- URL pública centralizada en `src/lib/site.ts` (`NEXT_PUBLIC_SITE_URL`,
  respaldo local), usada por `metadataBase`, robots y sitemap.
- Componentes UI: `site-header`/`site-nav` (menú móvil accesible),
  `site-footer`, `work-card`, `arrangement-card`, `collection-card`,
  `score-lines`, `section-heading`, `ui/{badge,button,input}`.

### Implementado vs. simulado (al 2026-10-27)

- **Real:** navegación, búsqueda/filtros, responsive, SEO/sitemap/robots, 404,
  build y despliegue preparado para Cloudflare Workers.
- **Simulado:** todo el catálogo. No existen PDFs, archivos por arreglo,
  autenticación, favoritos, aportes ni panel administrativo.

### Configuración Cloudflare

- `wrangler.jsonc`: worker `partituras-cristianas-chile`, flags
  `nodejs_compat`, `global_fetch_strictly_public`, `enable_request_signal`,
  assets `.open-next/assets`, self-reference binding. Sin R2/D1/Images.
- `open-next.config.ts`: `defineCloudflareConfig({})` sin caché incremental.
- `public/_headers`: caché inmutable para `/_next/static`.
- Scripts: `preview` (local, sin credenciales) y `deploy` (requiere
  `wrangler login`).

## 2. Referencia del proyecto original (solo lectura)

`C:\Users\Donko\Desktop\donko-partituras` — no modificado. Backups tampoco.

Lo directamente reutilizable:

- **`supabase/migrations_clean/`** (7 migraciones, 2026-10-22): esquema ya
  auditado (`AUDITORIA_SEGURIDAD_MIGRACIONES.md` documenta 4 vulnerabilidades
  corregidas: VULN-01 aprobación de archivos ajenos, VULN-02 carrera en
  bootstrap del primer admin, VULN-03 staging de subcarpetas, VULN-04 PDF
  retirado por enlace compartido).
- `roles`/`user_roles` + `bootstrap_claim_initial_admin()` con `FOR UPDATE`.
- `score_files` con ciclo editorial (`availability`), `sha256_hash`,
  `previous_file_id` y triggers anti-ciclo/anti-bifurcación.
- RPC editoriales transaccionales: `approve_contribution`,
  `reject_contribution`, `withdraw_score_file`, `replace_score_file_direct`.
- Bucket `score-files` privado (25 MB, `application/pdf`), staging
  `staging/{auth.uid()}/*.pdf`, RPC `verify_score_file_access`, TTL firmado
  900 s (migración 007).
- `tools/sql/supabase_readonly_inventory.sql`: inventario de solo lectura
  reutilizable para verificar el nuevo proyecto Supabase.
- `lib/supabaseClient.ts` y `catalogMode.ts` como referencia de forma
  (el nuevo cliente debe usar `@supabase/ssr`, ausente en el original).
- **No existía en el original:** favoritos (REQ-017), panel admin funcional,
  upload real, integración frontend con Supabase (auditoría
  `AUDITORIA_DONKO.md`: frontend 100% mock; migraciones viejas 001–005 con
  RLS `USING (true)` y email público — antipatrones a no repetir).

## 3. Riesgos identificados (revisión de diseño, no SAST/SCA)

### Demostrados o derivados de decisiones del proyecto

1. La anon key de Supabase es pública por diseño: la seguridad descansa
   íntegramente en RLS. Hereda el riesgo de las migraciones viejas del
   original (políticas abiertas).
2. `SUPABASE_SERVICE_ROLE_KEY` nunca en cliente ni repo ni como
   `NEXT_PUBLIC_*`; solo variables de entorno server-side del Worker.
3. Escalada de privilegios si `user_roles` tuviera políticas permisivas.
   Mitigación: bootstrap atómico de primer admin + `SECURITY DEFINER` con
   `search_path` fijo.
4. PDFs polyglot y omitir restricción de distribución: validar magic bytes
   `%PDF-` y tamaño server-side; `is_publicly_downloadable` decide por archivo.
5. `audit_log` no debe tener políticas de mutación para clientes; escritura
   solo vía RPC `SECURITY DEFINER` en la misma transacción que la acción.

### Pendientes de verificar (no afirmar sin prueba)

6. Enumeración de cuentas y rate limiting del Auth de Supabase según su
   configuración (a revisar al activar).
7. Compatibilidad de `@supabase/supabase-js` / `@supabase/ssr` con workerd
   (Node compat) — comprobar con `npm run preview`, no asumir.
8. Cabeceras de seguridad (CSP, HSTS) en Workers/OpenNext.
9. `Content-Disposition` seguro para nombres de archivo con caracteres raros.

### Prohibiciones registradas

- No repetir `USING (true)` en ninguna política.
- No exponer emails en vistas públicas.
- No permitir que el cliente escriba `audit_log` ni la ruta final de Storage
  canónica (solo su staging `staging/{auth.uid()}/`).
