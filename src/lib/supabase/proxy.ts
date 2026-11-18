import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getAuthCookieOptions } from "./cookie-options";
import { getSupabaseEnv, SupabaseConfigError } from "./server";

export async function refreshSupabaseSession(
  request: NextRequest
): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  let env;
  try {
    env = getSupabaseEnv();
  } catch (error) {
    if (error instanceof SupabaseConfigError) {
      console.error(
        "[auth] Variables de entorno de Supabase ausentes:",
        error.missingVars
      );
    }
    return response;
  }

  try {
    const supabase = createServerClient(env.url, env.key, {
      cookieOptions: getAuthCookieOptions(),
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          for (const [key, value] of Object.entries(headers)) {
            response.headers.set(key, value);
          }
        },
      },
    });

    await supabase.auth.getUser();
  } catch (error) {
    console.error(
      "[auth] Error refrescando la sesión:",
      error instanceof Error ? error.message : error
    );
  }

  return response;
}
