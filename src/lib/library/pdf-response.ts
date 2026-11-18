import "server-only";
import { NextResponse } from "next/server";
import {
  getSupabaseAdminClient,
  MissingSecretKeyError,
} from "@/lib/supabase/admin";
import { SCORE_BUCKET, SIGNED_URL_TTL_SECONDS } from "./storage-paths";
import { isUuid, sanitizeDownloadFilename } from "./validation";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: NO_STORE_HEADERS }
  );
}

export async function createScorePdfResponse(
  rawId: string,
  download: boolean
): Promise<NextResponse> {
  const id = rawId.trim().toLowerCase();
  if (!isUuid(id)) {
    return jsonError("La partitura solicitada no existe.", 404);
  }

  try {
    const admin = getSupabaseAdminClient();
    const { data, error } = await admin
      .from("scores")
      .select("id, title, storage_path")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[pdf] Error consultando la partitura:", error.message);
      return jsonError("No pudimos preparar el archivo. Inténtalo de nuevo.", 500);
    }
    if (!data) {
      return jsonError("La partitura solicitada no existe.", 404);
    }

    const { data: signed, error: signedError } = await admin.storage
      .from(SCORE_BUCKET)
      .createSignedUrl(
        data.storage_path as string,
        SIGNED_URL_TTL_SECONDS,
        download
          ? { download: sanitizeDownloadFilename(data.title as string) }
          : undefined
      );

    if (signedError || !signed?.signedUrl) {
      console.error(
        "[pdf] No se pudo firmar la URL:",
        signedError?.message ?? "sin URL"
      );
      return jsonError(
        "El archivo no está disponible en este momento.",
        404
      );
    }

    return NextResponse.redirect(signed.signedUrl, {
      status: 302,
      headers: NO_STORE_HEADERS,
    });
  } catch (error) {
    if (error instanceof MissingSecretKeyError) {
      console.error("[pdf] Falta SUPABASE_SECRET_KEY.");
      return jsonError(
        "El servicio de archivos no está configurado en este entorno.",
        503
      );
    }

    console.error(
      "[pdf] Error preparando el archivo:",
      error instanceof Error ? error.message : error
    );
    return jsonError("No pudimos preparar el archivo. Inténtalo de nuevo.", 500);
  }
}
