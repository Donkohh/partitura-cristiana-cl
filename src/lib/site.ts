// URL pública del sitio. Se define al desplegar con la variable de entorno
// NEXT_PUBLIC_SITE_URL (por ejemplo https://partiturascristianas.cl).
// El respaldo solo aplica en desarrollo local.
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
);
