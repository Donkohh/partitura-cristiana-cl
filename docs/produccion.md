# Producción

## Separación de entornos

Usa dos proyectos Supabase independientes:

- **Desarrollo**: pruebas locales, datos descartables.
- **Producción**: datos reales, acceso restringido.

No reutilices el mismo proyecto ni las mismas claves para ambos entornos. El
bucket `score-files` también debe ser independiente.

## Variables

Crea `.env.prod` a partir de `.env.prod.example` (está ignorado por Git):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (solo el origen, por ejemplo
  `https://donko-partituras.mi-cuenta.workers.dev`)
- `ADMIN_EMAIL`

`.env.prod` no lo carga Next automáticamente. Lo lee `scripts/deploy-prod.mjs`
para que `npm run preview` nunca apunte a producción por accidente.

En Cloudflare, configura como secretos del Worker:

- `ADMIN_EMAIL`
- `SUPABASE_SECRET_KEY`

```bash
npx wrangler login
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put SUPABASE_SECRET_KEY
```

`SUPABASE_SECRET_KEY` no debe llevar prefijo `NEXT_PUBLIC_`, no debe estar en
`.env.prod` ni exponerse al navegador. El script de deploy comprueba que ambos
secretos existan.

## Supabase de producción

1. Ejecuta `supabase/migrations/0001_donko_library.sql`.
2. Ejecuta `supabase/migrations/0002_pdf_limit_10mb.sql`.
3. Desactiva el registro público en Auth.
4. Crea y confirma el usuario de `ADMIN_EMAIL` con una contraseña larga.
5. Verifica que el bucket `score-files` sea privado, solo acepte
   `application/pdf` y tenga un límite de 10 MB.

Antes de aplicar `0002`, comprueba que no haya archivos mayores:

```sql
select count(*) from public.scores where file_size_bytes > 10485760;
```

Si el resultado es mayor que cero, la migración fallará y no cambiará nada.
Decide si esos archivos se conservan fuera del catálogo o si necesitas un plan
de Workers con más CPU.

## Publicación

```bash
npm run deploy:check  # valida .env.prod, wrangler y secretos
npm run deploy        # compila con .env.prod y despliega
```

Si todavía no conoces la URL de workers.dev, usa un valor provisional, despliega
una vez, copia la URL real que entrega Wrangler, actualízala en `.env.prod` y
vuelve a ejecutar `npm run deploy`. `NEXT_PUBLIC_SITE_URL` afecta metadatos,
`robots.txt` y `sitemap.xml`, así que el segundo deploy es obligatorio.

## Cloudflare Workers Free

El plan Free tiene 10 ms de CPU por invocación. Por eso el límite de PDF es de
10 MB. Si una subida grande falla por tiempo de CPU en producción:

1. Baja `MAX_PDF_MB` a 5 en `src/lib/library/pdf.ts`.
2. Ajusta `bodySizeLimit` en `next.config.ts` a `7mb`.
3. Crea una migración que baje el bucket y el constraint a 5 MB.
4. Vuelve a ejecutar tests, preview y deploy.

La lectura y descarga de PDFs no debería consumir CPU significativa porque usa
URLs firmadas de Supabase.

## Verificación posterior

- `GET /` responde y muestra la biblioteca.
- `/admin` redirige a `/admin/login` sin sesión.
- El login del administrador funciona y la cookie es `HttpOnly`, `Secure` y
  `SameSite=Lax`.
- Se puede subir un PDF pequeño, verlo y descargarlo.
- Un PDF mayor a 10 MB se rechaza con un mensaje claro.
- Una cuenta que no sea `ADMIN_EMAIL` no accede al panel.
- `robots.txt` y `sitemap.xml` usan la URL real de workers.dev.
- Las cabeceras incluyen `Content-Security-Policy`, `Strict-Transport-Security`,
  `X-Content-Type-Options`, `X-Frame-Options` y `Referrer-Policy`.

```bash
curl -I https://donko-partituras.mi-cuenta.workers.dev/
npx wrangler tail
```

## Rollback

```bash
npx wrangler deployments list
npx wrangler rollback
```

Los cambios de base de datos no se revierten con el Worker. Si una migración
falla, revisa el SQL antes de reintentar.

## Operación y seguridad

- Activa 2FA en las cuentas de Cloudflare y Supabase.
- No compartas `SUPABASE_SECRET_KEY`; permite escribir y borrar en toda la base.
- Mantén el registro público de Supabase desactivado.
- Revisa periódicamente los logs y las dependencias (`npm audit`).
- Confirma el plan de backups de tu proyecto Supabase. Si no incluye backups
  automáticos, exporta la base y el bucket con regularidad.
- La lectura pública es intencional: cualquiera con el enlace puede ver o
  descargar un PDF. Las escrituras solo existen en el panel protegido.
