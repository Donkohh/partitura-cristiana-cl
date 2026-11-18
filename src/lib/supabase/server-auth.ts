import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getAuthCookieOptions } from "./cookie-options";
import { getSupabaseEnv } from "./server";

export async function getAuthClient() {
  const env = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(env.url, env.key, {
    cookieOptions: getAuthCookieOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // El refresco real ocurre en el proxy y en las Server Actions.
        }
      },
    },
  });
}
