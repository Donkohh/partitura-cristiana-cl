# Plan de implementación — Fase 1 (Supabase + plataforma real)

> Requiere leer junto a `docs/arquitectura-fase-1.md` (decisiones [CONFIRMADO])
> y `docs/audit/analisis-fase-1.md` (estado de partida verificado).
> Este plan se ejecuta en orden estricto: cada etapa depende de la anterior.
> Se detiene y verifica al final de cada etapa.

Convención de verificación base para todas las etapas:

```bash
npm run lint && npm run typecheck && npm run test && npm run build
npm run preview   # humo end-to-end del bundle OpenNext en workerd, sin credenciales
```

---

## Etapa 0 — Control de versiones y base de documentación

**Objetivo:** las migraciones de Supabase y el changelog "versionados junto al
código fuente" (requisito confirmado) exigen un repositorio Git. La V2
actualmente no lo es.

**Archivos:** inicialización de Git raíz del proyecto (`.gitignore` ya listo,
excluye `.open-next/`, `.wrangler/`, `.env*`, node_modules).
**Sin dependencias nuevas.**

**Aceptación:**
- `git status` limpio tras el commit inicial; el proyecto original y su backup
  quedan fuera (no se inicializan).
- `docs/` versionada desde el primer commit.

**Cliente requerido de vos (bloqueante):** autorizar la inicialización del repo
(no la hago sin permiso explícito, según acuerdo previo). Remoto (GitHub u otro)
queda a tu decisión posterior; el plan solo necesita Git local.

## Rutas públicas nuevas (independientes de Supabase)

Se pueden ejecutar en paralelo a las etapas 1–2 (frontend puro, cero dependencia
de base de datos), pero se listan aquí como bloque propio para no mezclar código
de páginas con código de datos:

- **`/acerca-de`**: `src/app/acerca-de/page.tsx` + metadatos; enlace en
  `src/components/site-footer.tsx` ("Sobre el proyecto" apunta a la nueva
  página en lugar de `/#archivo`). Contenido literal en
  `docs/arquitectura-fase-1.md §8`.
- **`/changelog`**: `src/data/changelog.ts` (estructura
  `{ version, date, entries[] }`, ordenada más-recente-primero) +
  `src/app/changelog/page.tsx`; enlace en el mismo bloque del footer.
- Actualizar `src/app/sitemap.ts` para incluir las dos rutas nuevas.

**Aceptación:** ambas rutas prerenderizadas en `npm run build`; navegación de
localStorage no involucionada; enlaces del footer verificados en desktop y
móvil; `sitemap.xml` regenerado con las nuevas URLs.

---

## Etapa 1 — Migraciones Supabase 0001–0005 (BD sin tocar por clientes)

**Objetivo:** crear el esquema del §4 en el proyecto Supabase nuevo (está
vacío). Migraciones escritas en `supabase/migrations/` de **esta V2**; portar y
adaptar (no copiar a ciegas) desde `migrations_clean` del original: quitar
`contributions`/`withdrawal_requests`/`spaces`/`share_links` (excluidos de esta
fase), dejar `roles` como columnas `admin`/`editor` semilla y conservar los
triggers anti-ciclo de `score_files`.

Orden de migraciones:

| # | Contenido | Origen |
|---|---|---|
| 0001 | extensiones, `profiles`, `roles`, `user_roles`, `is_admin()`/`is_editor_or_admin()` con `search_path` fijo, `bootstrap_claim_initial_admin()`, trigger `handle_new_user`, vista `public_profiles` sin email | migration 001 (original) |
| 0002 | `collections` (seed 4) + `works` + `arrangements` + `collections_works` + `collections_arrangements` con RLS lectura pública | migration 002 + puente nuevo |
| 0003 | `score_files` con `availability`, `is_publicly_downloadable`, `sha256_hash` UNIQUE, `previous_file_id` + triggers anti-ciclo/anti-bifurcación, índices | migration 004 |
| 0004 | `favorites` con UNIQUE `(user_id, work_id)` | nuevo |
| 0005 | `audit_log` + `record_audit_event()` + RPCs transaccionales editoriales (`publish_score_file`, `withdraw_score_file`, `replace_score_file`, `restore_file`) sin módulo `contributions` | migration 003 + 005 adaptadas |

Todo esto se **autocontiene en RLS desde 0002** — ninguna tabla se crea sin RLS
habilitado y políticas explícitas (política del proyecto; prohibición
registrada en la auditoría).

**Aceptación (verificables, todas):**
- `tools/sql` del original adaptado a inventario en el SQL Editor: 0 políticas
  con `USING (true)`; RLS activado en todas las tablas listadas; email nunca en
  vistas públicas.
- `anon` puede leer catálogo publicado y cargar colecciones seed; `anon` no
  puede: INSERT en ninguna tabla; ver staging; ver archivos `pending`.
- Intentar auto-promoción a `admin` vía SQL con credenciales de usuario
  devuelve violación de RLS; solo el bootstrap funciona una vez.

**Dependencias:** ninguna; migraciones corren por ti manualmente en el
SQL Editor de Supabase (el plan no ejecuta migraciones ni pide CLI/credentials
automáticamente).

## Etapa 2 — Cliente Supabase y capa de datos en la V2

**Archivos nuevos:**
- `npm i @supabase/supabase-js @supabase/ssr` — **única instalación de la fase**.
- `src/lib/supabase/client.ts` (browser, usado solo en Client Components de
  interacción) y `src/lib/supabase/server.ts` (cookie-based `@supabase/ssr`,
  unificado con el adapter de OpenNext). **No se expondrán claves de service
  role en estos módulos ni en `next.config.ts`.**
- `src/lib/catalog-mode.ts` — selector `demo | supabase` vía variable de
  entorno `CATALOG_DATA_SOURCE`; si es `demo` en build de producción, error de
  build (lección del original `catalogMode.ts`).
- `src/lib/catalog-supabase.ts` — mismas firmas que `src/data/demo-catalog.ts`
  (`getCatalogEntries`, `getCollectionEntries`, `getWorkById`,
  `getArrangementsForWork`, etc.) para que las páginas solo cambien el import.
- `src/types/music.ts` — extender con `ScoreFile` (ver §4) sin romper la demo.

**Riesgos / verificaciones especiales:**
1. Compatibilidad `@supabase/supabase-js`+`@supabase/ssr` con workerd: correr
   `npm run preview` con datos reales (fase 1 aplicada con datos de prueba) y
   confirmar que listados de `/catalogo`, `/obras/[id]`, `/colecciones/[slug]`
   devuelven lo mismo en el runtime de Workers y en `next start` local. Si
   falla: capturar y documentar (posible caso de uso de Node-fetch shim).
2. `next/image`: las imágenes de obras no estarán en Supabase Storage en esta
   fase (los PDF sí); `unoptimized` se mantiene.
3. Los tests node:test de búsqueda pasan sin cambios (lógica pura intacta).

**Aceptación:**
- `CATALOG_DATA_SOURCE=supabase` + URL/anon reales en local → las 4 rutas
  públicas muestran el catálogo real de Supabase y la búsqueda sigue
  funcionando idéntica (los filtros `voz`/`colección` pasan a SQL RPC u
  `ilike`).
- `CATALOG_DATA_SOURCE=demo` sigue funcionando para desarrollo sin BD.
- Bundle de producción **no** contiene secretos: grep del bundle por claves de
  service role/backend = 0 resultados.

## Etapa 3 — Autenticación, perfiles y favoritos

**Archivos nuevos:**
- `src/app/(auth)/acceder/page.tsx` (login + signup con email/contraseña,
  confirmando dirección por el dashboard de Supabase antes de loguear).
- `src/components/auth/` (formulario, logout) y servidor de acciones
  (`src/lib/auth/actions.ts`).
- `src/app/favoritos/page.tsx` (protegida, requiere sesión).
- Botón de favorito en `work-card.tsx` (Client Component con acción server que
  inserta/elimina en `favorites`; sin escritura client-side directa además de
  RLS).

**Dependencias:** etapas 1 (usuarios/RLS) y 2 (cliente). Supabase Auth se
configura desde el dashboard (debes tú hacerlo, con credenciales de tu cuenta
de Supabase): permitir registro con email+password y template de confirmación.

**RxR: crear la cuenta de admin** — es un paso con credenciales tuyas, fuera
del plan: registro manual del primer admin en Auth y luego ejecución de
`bootstrap_claim_initial_admin()` una sola vez, documentado en el propio
README de esa etapa.

**Aceptación:**
- Un usuario anon no puede ver `/favoritos` ni otros `profiles` con email
  (comprobado que la vista `public_profiles` no expone email).
- Dar favor + recargar + sesión en otro dispositivo → favorito persiste.
- `audit_log` sigue siendo `0` filas escritas por cliente.
- Manual: mismo email registrado dos veces no duplica perfil (trigger idempotente).

## Etapa 4 — Storage y publicación de PDFs

**Archivos/modules nuevos:**
- `src/lib/storage/paths.ts` — helpers de rutas (`staging/{user}/{uuid}.pdf`,
  canónica `works/{work_id}/{arrangement_id}/{score_file_id}.pdf`), **solo
  lógica** testeable.
- `src/lib/storage/validate-pdf.ts` — validación server-side: magic bytes
  cabecera `%PDF-` + cola `%%EOF`, límite de tamaño constate con RLS (25 MB),
  SHA-256 al aprobar.
- `src/app/admin/pdfs/page.tsx` (subida del editor a su staging) y flujos de
  publicación/retiro/reemplazo vía RPC seguro (`publish_score_file` etc., con
  auditoría atómica).
- Página ficha de arreglo: listar PDFs aprobados y botón "Abrir"/"Descargar"
  que llama a server action para obtener **URL firmada** con TTL 900 s solo
  si el archivo debe ser descargado (`availability='approved'` **y**
  `is_publicly_downloadable=true`).

**Dependencias:** definitivas de etapas 1–3; bucket privado creado en 0003
migración de storage (particular a `contributors` dir del original -= clave:
agentes `staging` solo del propio user; `service_role` es quien mueve a la
ruta canónica).

**Paso manual: creación del bucket** en dashboard de Supabase (o SQL
`insert into storage.buckets`) que ejecutarás tú.

**Aceptación:**
- Upload de `.pdf` real >1 MB desde el editor → staging existe, público no
  ve nada; publicación via RPC mueve a ruta canónica + estado
  `availability='approved'` + fila insertada en `audit_log` en la **misma
  transacción** (probe manual: fallo simulado de publish → no se mueve nada,
  no hay filas huérfanas en audit ni storage).
- Upload de un file no-PDF renombrado `.pdf` (magic bytes incorrectos) →
  rechazado, `sha256_hash` no almacena nada.
- Anon intenta leer `score-files/{...}` sin URL firmada → acceso denegado
  (RLS privado).
- Reemplazar un PDF (via `replace_score_file`) → la versión anterior queda
  `availability='replaced'`, con `previous_file_id` apuntando, el nuevo como
  única versión votada; el usuario/público NO puede seguir descargando la
  versión vieja (URL firmadas previas caducan en 15 min).
- `previous_file_id` con creciente auto-referencia manual trazada a
  error por trigger anti-ciclo.

## Etapa 5 — Panel administrativo (`/admin`)

**Archivos/modules nuevos:**
- `src/app/admin/layout.tsx` — *server* guard: si
  `!is_editor_or_admin()` (verificado contra Supabase, no estado de cliente)
  → `redirect('/acceder')`, sin render del árbol admin.
- `src/app/admin/obras/`, `src/app/admin/arrangements/`,
  `src/app/admin/colecciones/` — CRUD server-actions (no client-side) de
  catálogo, con validación de índices de slug (drift-free), siempre
  escribiendo `updated_at` y `audit_log` vía `record_audit_event()`.

**Dependencias:** etapas 1–4.

**Aceptación:**
- Usuario `authenticated` sin rol que abre `/admin` → redirect y **ningún**
  HTML de admin en la respuesta (probar con curl: no fugas de layout).
- Cada write de édicion produce una fila en `audit_log` con actor/acción/
  entidad/fecha/detalles mínimos; filtrar no exponibles los campos de
  auditoría a usuarios sin rol admin (página admin de auditoría solo admin).
- Un `editor` NO puede asignarse rol, ni editar roles, ni ver
  `audit_log` (RLS).

## Etapa 6 — Despliegue real en Cloudflare Workers

**Archivos:** sin nuevos con código; update de `.env`/variables wiring en
`wrangler.jsonc` si el adapter cambia el contrato de variables (no definitivo
en este diseño). Cloudflare Workers Builds (GitHub→CF) queda opcional; el
primer deploy es CLI manual con `wrangler login`.

**Aceptación:**
- `npm run deploy` desde local con tu `wrangler login` → versión en
  `partituras-cristianas-chile.workers.dev` sirviendo las rutas públicas con
  Supabase real; `/favoritos` y `/admin` protegidas; sitemap/robots
  correspondiendo a `NEXT_PUBLIC_SITE_URL` en Build Variables.
- Las secretas del Worker (`SUPABASE_SERVICE_ROLE_KEY` cuando exista) via
  `wrangler secret put`, no en el repo ni en Build Variables.

---

## Resumen de dependencias

```text
Etapa 0 ──► Etapa 1 ──► Etapa 2 ──► Etapa 3 ──► Etapa 4 ──► Etapa 5 ──► Etapa 6
(git)     (migraciones) (cliente)   (auth)      (storage)    (admin)     (deploy)
                        ▲
                        └── rutas públicas /acerca-de, /changelog: independientes,
                            ejecutables en paralelo desde ya
```

## Riesgos transversales (ya documentados en la auditoría, recordatorio operativo)

1. Personal de Supabase dashboard variables → configuración manual del Auth
   (templates, redirect URLs) es responsabilidad del dueño.
2. Debe existir al menos una sesión del Workers con `npm run preview` probada
   antes de cada fase mergeable para confirmar compat workerd.
3. Cambiar el contrato de roles después de fase 1 (ej. añadir rol `reviewer`)
   requiere una migración con políticas, no un campo oculto en `profiles`.

## Decisiones realmente pendientes / bloqueos

| # | Bloqueo | Quién | Impacto si no se resuelve |
|---|---|---|---|
| 1 | Autorizar/init **Git local** con commit inicial | tú | nada de Etapas 1+ puede activarse con el requisito "versionado junto al código" |
| 2 | Entregar **URL + anon key** del nuevo proyecto Supabase (como variables, nunca el service role en texto de chat) | tú | Etapa 2 no arranca |
| 3 | Aplicar migraciones 0001–0005 en el **SQL Editor de Supabase** con sesión de tu cuenta | tú | sin BD física, Etapas 2–5 no verificables |
| 4 | Crear en **dashboard de Supabase**: proveedor de Auth local email+password, confirmación de correo, redirect URLs permitidas, plantilla, y el primer usuario real de admin | tú | Etapa 3 bloqueada |
| 5 | Definir si la primera fase pública publica toda su contenido o solo colecciones/obras de prueba | tú | afecta seed en 0002 y flag `is_published` de obras demo |
| 6 | Confirmar uso de **`wrangler login`** por ti en Etapa 6 (nunca más adelante, nunca `CLOUDFLARE_API_TOKEN` en este repo) | tú | deploy final sin esto no se hace |

No hay pendientes de diseño interno: todo lo que podía decidirse sin
credenciales (modelo, roles, RLS, storage, páginas nuevas, cadencia de
versiones) quedó cerrado en `docs/arquitectura-fase-1.md`.
