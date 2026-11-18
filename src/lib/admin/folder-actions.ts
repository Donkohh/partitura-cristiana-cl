"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import {
  createFolder,
  deleteFolder,
  renameFolder,
} from "@/lib/library/operations";
import { createSupabaseLibraryRepository } from "@/lib/library/supabase-repository";
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

export async function crearCarpeta(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin("/admin/carpetas");

  try {
    const repository = createSupabaseLibraryRepository();
    const folder = await createFolder(repository, formString(formData, "name"));
    refreshLibrary();
    return { ok: true, message: `Carpeta «${folder.name}» creada.` };
  } catch (error) {
    return actionErrorState(error);
  }
}

export async function renombrarCarpeta(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin("/admin/carpetas");

  try {
    const repository = createSupabaseLibraryRepository();
    const folder = await renameFolder(
      repository,
      formString(formData, "folderId"),
      formString(formData, "name")
    );
    refreshLibrary();
    return { ok: true, message: `Carpeta renombrada a «${folder.name}».` };
  } catch (error) {
    return actionErrorState(error);
  }
}

export async function eliminarCarpeta(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin("/admin/carpetas");

  if (formString(formData, "intencion") !== "eliminar") {
    return { error: "La operación de eliminación no fue confirmada." };
  }

  try {
    const repository = createSupabaseLibraryRepository();
    const moved = await deleteFolder(
      repository,
      formString(formData, "folderId"),
      formString(formData, "mover") === "1"
    );
    refreshLibrary();
    return {
      ok: true,
      message:
        moved > 0
          ? `Carpeta eliminada. ${moved} partitura${moved === 1 ? "" : "s"} pasó a «Sin carpeta».`
          : "Carpeta eliminada.",
    };
  } catch (error) {
    return actionErrorState(error);
  }
}
