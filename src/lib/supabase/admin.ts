import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export class MissingSecretKeyError extends Error {
  constructor() {
    super(
      "El servidor no tiene configurada la clave privada de Supabase. Revisa SUPABASE_SECRET_KEY."
    );
    this.name = "MissingSecretKeyError";
  }
}

let cachedAdminClient: SupabaseClient | undefined;

export function getSupabaseAdminClient(): SupabaseClient {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new MissingSecretKeyError();
  }

  cachedAdminClient = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cachedAdminClient;
}
