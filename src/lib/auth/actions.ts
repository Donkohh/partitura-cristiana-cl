"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthClient } from "@/lib/supabase/server-auth";
import {
  getAdminPolicy,
  getSessionUser,
  userIsAdmin,
} from "@/lib/auth/admin";
import {
  mapAuthError,
  safeAdminRedirect,
  validateLoginFields,
  type FieldErrors,
} from "@/lib/auth/messages";

export interface LoginState {
  error?: string;
  fieldErrors?: FieldErrors;
}

function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function iniciarSesionAdmin(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const fields = {
    email: formString(formData, "email").trim(),
    password: formString(formData, "password"),
  };

  const fieldErrors = validateLoginFields(fields);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  if (!getAdminPolicy()) {
    console.error("[auth] Falta ADMIN_EMAIL en el entorno.");
    return { error: mapAuthError("no_configurado") };
  }

  try {
    const supabase = await getAuthClient();
    const { data, error } = await supabase.auth.signInWithPassword(fields);

    if (error) {
      return { error: mapAuthError(error.code ?? error.message) };
    }

    if (!userIsAdmin(data.user)) {
      await supabase.auth.signOut();
      return { error: mapAuthError("sin_permiso") };
    }
  } catch (cause) {
    console.error(
      "[auth] Error iniciando sesión:",
      cause instanceof Error ? cause.message : cause
    );
    return { error: mapAuthError(undefined) };
  }

  redirect(safeAdminRedirect(formString(formData, "redirigirA")));
}

export async function cerrarSesionAdmin(): Promise<void> {
  try {
    const supabase = await getAuthClient();
    await supabase.auth.signOut();
  } catch (cause) {
    console.error(
      "[auth] Error cerrando sesión:",
      cause instanceof Error ? cause.message : cause
    );
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function cerrarSesionSinPermiso(): Promise<void> {
  const user = await getSessionUser();
  if (user) {
    try {
      const supabase = await getAuthClient();
      await supabase.auth.signOut();
    } catch {
      // Sin sesión que cerrar.
    }
  }
  redirect("/admin/login");
}
