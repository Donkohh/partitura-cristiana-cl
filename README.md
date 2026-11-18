# Donko Partituras

Biblioteca personal de partituras en PDF. La portada es pública y permite
buscar, abrir y descargar archivos. Un único administrador gestiona carpetas y
partituras desde un panel privado.

> «Aquí subo las partituras que tengo y a veces uso».

## Stack

- Next.js 16.4.6 (App Router) + React 19 + Tailwind CSS 4.
- Supabase: Postgres, Auth y Storage privado.
- Cloudflare Workers con `@opennextjs/cloudflare`.

## Desarrollo

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Completa `.env.local` con las variables descritas en el archivo de ejemplo.

## Supabase

1. Crea un proyecto y ejecuta, en orden, las migraciones
   `supabase/migrations/0001_donko_library.sql` y
   `supabase/migrations/0002_pdf_limit_10mb.sql` en el SQL Editor.
2. En **Authentication → Providers**, activa Email. Desactiva el registro
   público para que nadie pueda crear cuentas.
3. Crea manualmente el usuario administrador con el correo de `ADMIN_EMAIL` y
   confírmalo.
4. Copia la URL del proyecto, la clave publishable y la clave secreta a
   `.env.local`.

Las migraciones crean las tablas `folders` y `scores`, RLS de solo lectura para
el catálogo público, la función atómica `delete_library_folder` y el bucket
privado `score-files` (10 MB, solo PDF).

## Verificación

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Los tests usan `node:test` y un pequeño cargador para resolver imports `.ts`.
Cubren búsqueda, validación, PDFs, políticas de administrador y operaciones con
compensación entre base de datos y Storage.

## Producción

Usa un proyecto Supabase distinto al de desarrollo. Crea `.env.prod` a partir
de `.env.prod.example` con las variables `NEXT_PUBLIC_*` y `ADMIN_EMAIL`. En
Cloudflare configura `ADMIN_EMAIL` y `SUPABASE_SECRET_KEY` como secretos del
Worker. Ver `docs/produccion.md`.

```bash
npm run preview       # build + preview local con .env.local y .dev.vars
npm run deploy:check  # valida .env.prod y los secretos sin desplegar
npm run deploy        # build de producción + deploy
```

`npm run deploy` carga `.env.prod` explícitamente, valida que no apunte al
Supabase de `.env.local` y comprueba que los secretos existan. No pongas
`SUPABASE_SECRET_KEY` en `.env.prod` ni en archivos versionados.

No ejecutes `deploy` ni migraciones remotas sin revisar antes el entorno.
