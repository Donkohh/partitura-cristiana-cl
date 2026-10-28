# Partituras Cristianas Chile V2

Biblioteca digital de partituras para coros y ministerios musicales
cristianos de Chile. Partituras Cristianas Chile está en proceso de
convertirse en plataforma real sobre Next.js, Supabase y Cloudflare Workers.
Esta entrega mantiene un catálogo de demostración con navegación por
colecciones y fichas de obra.

## Documentación

- `docs/arquitectura-fase-1.md` — decisiones de arquitectura confirmadas
  (modelo de datos, roles, RLS, Storage, nuevas rutas).
- `docs/plan-implementacion-fase-1.md` — plan de implementación por etapas,
  con criterios de aceptación y bloqueos pendientes.
- `docs/audit/analisis-fase-1.md` — análisis de partida de la V2 y referencias
  del proyecto original.

## Desarrollo

```bash
npm run dev
```

Abre `http://localhost:3000`.

## Verificación

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Despliegue (Cloudflare Workers)

La app se despliega en Cloudflare **Workers** con
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)
(Cloudflare Pages/`next-on-pages` no es compatible con esta versión).

Comandos:

```bash
npm run preview   # build + preview local en el runtime de Workers (sin credenciales)
npm run deploy    # build + deploy a Cloudflare (requiere wrangler login)
```

Notas:

- `cacheComponents`/PPR está desactivado en `next.config.ts`: el render
  por etapas de Cache Components aún no es compatible con el runtime de
  Workers del adaptador (1.20.x). Revisar al actualizar el adaptador.
- `/catalogo` se renderiza a pedido con los parámetros de búsqueda;
  el resto de las rutas es estático. `sitemap.xml` y `robots.txt`
  quedan prerenderizados.
- No se usan bindings de pago: sin R2/D1 (no hay ISR ni `use cache`) y
  con `images.unoptimized` (las fotos se sirven tal cual desde assets).
- Opcional: define `NEXT_PUBLIC_SITE_URL` como *Build Variable* en el
  pipeline de Cloudflare con la URL final del sitio (por ejemplo
  `https://partiturascristianas.cl`). La usan los metadatos canónicos,
  `robots.txt` y `sitemap.xml`. Sin ella quedan apuntando al respaldo
  local y conviene corregirla antes de indexar el sitio en buscadores.

## Alcance actual

- Inicio editorial responsive.
- Catálogo demo con búsqueda y filtros por formación y colección.
- Fichas de obra y colección.
- Sin conexión a Supabase, autenticación ni descargas reales.
- Los datos de demostración viven en `src/data/demo-catalog.ts`.

La visualización y descarga segura de partituras, junto con la gestión de
permisos, se incorporarán en una etapa posterior.
