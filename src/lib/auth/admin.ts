import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getAuthClient } from "@/lib/supabase/server-auth";
import { isAdminUser, type AdminPolicy } from "./admin-policy";
import { safeInternalRedirect } from "./messages";

export const getSessionUser = cache(async (): Promise<User | null> => {
  try {
    const supabase = await getAuthClient();
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  } catch {
    return null;
  }
});

export function getAdminPolicy(): AdminPolicy | null {
  const email = process.env.ADMIN_EMAIL?.trim();
  return email ? { email } : null;
}

export function userIsAdmin(user: User | null): boolean {
  if (!user) return false;
  return isAdminUser(
    {
      id: user.id,
      email: user.email,
      emailConfirmedAt: user.email_confirmed_at ?? null,
    },
    getAdminPolicy()
  );
}

export async function requireAdmin(
  targetPath = "/admin/partituras"
): Promise<User> {
  const user = await getSessionUser();
  const destino = safeInternalRedirect(targetPath) ?? "/admin/partituras";

  if (!user) {
    redirect(`/admin/login?redirigirA=${encodeURIComponent(destino)}`);
  }

  if (!getAdminPolicy()) {
    console.error("[auth] Falta ADMIN_EMAIL en el entorno.");
    redirect("/admin/login?error=no_configurado");
  }

  if (!userIsAdmin(user)) {
    redirect("/admin/login?error=sin_permiso");
  }

  return user as User;
}
