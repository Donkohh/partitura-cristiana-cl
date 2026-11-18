import { LibraryError } from "@/lib/library/errors";
import { MissingSecretKeyError } from "@/lib/supabase/admin";
import type { ActionState } from "./action-state";

export type { ActionState };

export function actionErrorState(error: unknown): ActionState {
  if (error instanceof LibraryError) {
    return { error: error.message };
  }

  if (error instanceof MissingSecretKeyError) {
    return { error: error.message };
  }

  console.error(
    "[admin] Error en una operación:",
    error instanceof Error ? error.message : error
  );
  return {
    error: "No pudimos completar la operación. Inténtalo de nuevo.",
  };
}
