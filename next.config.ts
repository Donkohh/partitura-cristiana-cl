import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // NOTA Cloudflare: `cacheComponents`/`partialPrefetching` se desactivaron
  // porque el running de render por etapas de Cache Components no está
  // soportado todavía por @opennextjs/cloudflare en produção (el Worker se
  // cuelga en workerd). Reactivarlas cuando el adaptador publiquese el soporte.
  images: {
    // El servicio de optimización de imágenes de Cloudflare (binding IMAGES)
    // requiere Cloudflare Images (de pago). Las fotos del sitio son locales
    // y se sirven sin optimización en el runtime de Workers.
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
