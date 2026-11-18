# Instalación local

## Requisitos

- Node.js 24 o superior.
- npm 11 o superior.
- Un proyecto de Supabase (puede ser el de desarrollo).

## Pasos

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Crea `.env.local` a partir de `.env.local.example` y completa:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (`http://localhost:3000` en local)
   - `ADMIN_EMAIL`
   - `SUPABASE_SECRET_KEY`

3. Ejecuta, en orden, las migraciones en el SQL Editor del proyecto:

   - `supabase/migrations/0001_donko_library.sql`
   - `supabase/migrations/0002_pdf_limit_10mb.sql`

4. En Supabase Auth:

   - Activa el proveedor Email.
   - Desactiva el registro público.
   - Crea a mano el usuario cuyo correo coincide con `ADMIN_EMAIL`.
   - Confirma ese usuario y usa una contraseña larga y única.

5. Inicia el sitio:

   ```bash
   npm run dev
   ```

6. Entra a `/admin/login` con el usuario administrador.

## Comprobaciones

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Problemas frecuentes

- **«El acceso no está configurado»**: falta `ADMIN_EMAIL` en el entorno.
- **«Esta cuenta no es la administradora»**: el correo de la sesión no coincide
  con `ADMIN_EMAIL` o el usuario no está confirmado.
- **La biblioteca no carga**: revisa la URL y la clave publishable, y que la
  migración se haya ejecutado.
- **No se pueden subir PDFs**: revisa `SUPABASE_SECRET_KEY` y que el bucket
  `score-files` exista.
- **«El PDF supera el límite de 10 MB»**: el límite es intencional para
  Cloudflare Workers Free. No lo subas sin revisar el plan y la configuración de
  `MAX_PDF_MB`, la migración y `bodySizeLimit`.
