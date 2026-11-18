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
cp .dev.vars.example .dev.vars
npm run dev
```

Completa `.env.local` solo con las variables públicas. Los secretos
(`ADMIN_EMAIL` y `SUPABASE_SECRET_KEY`) van en `.dev.vars`; `npm run dev` y
`npm run preview` lo cargan. No pongas secretos en archivos `.env*`: OpenNext los
incrustaría en el Worker.

## Supabase

1. Crea un proyecto y ejecuta, en orden, las migraciones
   `supabase/migrations/0001_donko_library.sql` y
   `supabase/migrations/0002_pdf_limit_10mb.sql` en el SQL Editor.
2. En **Authentication → Providers**, activa Email. Desactiva el registro
   público para que nadie pueda crear cuentas.
3. Crea manualmente el usuario administrador con el correo de `ADMIN_EMAIL` y
   confírmalo.
4. Copia la URL del proyecto y la clave publishable a `.env.local`; copia
   `ADMIN_EMAIL` y `SUPABASE_SECRET_KEY` a `.dev.vars`.

Las migraciones crean las tablas `folders` y `scores`, RLS de solo lectura para
el catálogo público, la función atómica `delete_library_folder` y el bucket
privado `score-files` (10 MB, solo PDF).

Con un Personal Access Token de Supabase en `.supabase-token` puedes aplicarlas
y desactivar el registro público de una vez:

```bash
npm run db:secure
```

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

Usa un proyecto Supabase distinto al de desarrollo si puedes. Crea `.env.prod`
a partir de `.env.prod.example` con las variables `NEXT_PUBLIC_*` y
`ADMIN_EMAIL`. En Cloudflare configura `ADMIN_EMAIL` y `SUPABASE_SECRET_KEY`
como secretos del Worker. Ver `docs/produccion.md`.

Si usas un único proyecto, los scripts `deploy` y `deploy:check` ya incluyen
`--allow-same-supabase`; aun así, los cambios locales pueden afectar datos
reales.

```bash
npm run preview       # build + preview local con .env.local y .dev.vars
npm run deploy:check  # valida .env.prod y los secretos sin desplegar
npm run deploy        # build de producción + deploy
```

`npm run deploy` carga `.env.prod` explícitamente, valida que no apunte al
Supabase de `.env.local` y comprueba que los secretos existan. Genera un
`.env.production.local` temporal con las variables públicas para el build y lo
elimina al terminar. También aborta si encuentra secretos en `.env*` o en
`.open-next/cloudflare/next-env.mjs`. No pongas `SUPABASE_SECRET_KEY` en
`.env.prod`, en `.env*` ni en archivos versionados.

No ejecutes `deploy` ni migraciones remotas sin revisar antes el entorno.
