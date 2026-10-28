import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Sin caché incremental (R2/KV): el catálogo no usa ISR ni 'use cache'.
// Si en el futuro se suma ISR, activar el incrementalCache según docs de OpenNext.
export default defineCloudflareConfig({});
