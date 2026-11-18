import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { LibraryError } from "./errors";
import type { FileStore } from "./operations";
import { SCORE_BUCKET } from "./storage-paths";

export function createSupabaseFileStore(): FileStore {
  const client = getSupabaseAdminClient();

  return {
    async upload(path, bytes, contentType) {
      const { error } = await client.storage
        .from(SCORE_BUCKET)
        .upload(path, bytes, { contentType, upsert: false });

      if (error) {
        console.error("[biblioteca] Error subiendo PDF:", error.message);
        throw new LibraryError(
          "STORAGE_UPLOAD_FAILED",
          "No pudimos guardar el PDF. Inténtalo de nuevo."
        );
      }
    },

    async remove(path) {
      const { error } = await client.storage.from(SCORE_BUCKET).remove([path]);

      if (error) {
        console.error("[biblioteca] Error borrando PDF:", error.message);
        throw new LibraryError(
          "STORAGE_DELETE_FAILED",
          "No pudimos borrar el archivo de Storage."
        );
      }
    },
  };
}
