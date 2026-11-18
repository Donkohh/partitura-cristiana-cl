"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { LibraryError } from "@/lib/library/errors";
import {
  createScore,
  deleteScore,
  replaceScorePdf,
  updateScoreMetadata,
  type PdfInput,
} from "@/lib/library/operations";
import { MAX_PDF_BYTES, MAX_PDF_MB } from "@/lib/library/pdf";
import { createSupabaseFileStore } from "@/lib/library/supabase-storage";
import { createSupabaseLibraryRepository } from "@/lib/library/supabase-repository";
import { parseFolderId } from "@/lib/library/validation";
import { actionErrorState } from "./messages";
import type { ActionState } from "./action-state";

function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function refreshLibrary() {
  revalidatePath("/");
  revalidatePath("/admin/partituras");
  revalidatePath("/admin/carpetas");
}

async function readPdf(formData: FormData): Promise<PdfInput> {
  const file = formData.get("archivo");
  if (!(file instanceof File) || file.size === 0) {
    throw new LibraryError("PDF_EMPTY", "Selecciona un archivo PDF.");
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new LibraryError(
      "PDF_TOO_LARGE",
      `El PDF supera el límite de ${MAX_PDF_MB} MB.`
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  return { bytes, originalFilename: file.name };
}

export async function subirPartitura(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin("/admin/partituras");

  try {
    const repository = createSupabaseLibraryRepository();
    const store = createSupabaseFileStore();
    const score = await createScore(repository, store, {
      title: formString(formData, "title"),
      folderId: parseFolderId(formData.get("folderId")),
      pdf: await readPdf(formData),
    });
    refreshLibrary();
    return { ok: true, message: `«${score.title}» se agregó a la biblioteca.` };
  } catch (error) {
    return actionErrorState(error);
  }
}

export async function actualizarPartitura(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin("/admin/partituras");

  try {
    const repository = createSupabaseLibraryRepository();
    const score = await updateScoreMetadata(
      repository,
      formString(formData, "scoreId"),
      {
        title: formString(formData, "title"),
        folderId: parseFolderId(formData.get("folderId")),
      }
    );
    refreshLibrary();
    return { ok: true, message: `«${score.title}» se actualizó.` };
  } catch (error) {
    return actionErrorState(error);
  }
}

export async function reemplazarPartitura(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin("/admin/partituras");

  if (formString(formData, "intencion") !== "reemplazar") {
    return { error: "El reemplazo no fue confirmado." };
  }

  try {
    const repository = createSupabaseLibraryRepository();
    const store = createSupabaseFileStore();
    const result = await replaceScorePdf(
      repository,
      store,
      formString(formData, "scoreId"),
      await readPdf(formData)
    );
    refreshLibrary();
    return {
      ok: true,
      message: `El PDF de «${result.score.title}» fue reemplazado.`,
      warning: result.warning,
    };
  } catch (error) {
    return actionErrorState(error);
  }
}

export async function eliminarPartitura(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin("/admin/partituras");

  if (formString(formData, "intencion") !== "eliminar") {
    return { error: "La eliminación no fue confirmada." };
  }

  try {
    const repository = createSupabaseLibraryRepository();
    const store = createSupabaseFileStore();
    const result = await deleteScore(
      repository,
      store,
      formString(formData, "scoreId")
    );
    refreshLibrary();
    return {
      ok: true,
      message: `«${result.score.title}» se eliminó de la biblioteca.`,
      warning: result.warning,
    };
  } catch (error) {
    return actionErrorState(error);
  }
}
