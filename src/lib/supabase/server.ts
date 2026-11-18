import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL_VAR = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_KEY_VARS = [
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

let cachedClient: SupabaseClient | undefined;

export class SupabaseConfigError extends Error {
  readonly missingVars: string[];

  constructor(missingVars: string[]) {
    super(
      `Configuración de Supabase incompleta. Faltan variables: ${missingVars.join(", ")}.`
    );
    this.name = "SupabaseConfigError";
    this.missingVars = missingVars;
  }
}

export function getSupabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missingVars = [
    ...(url ? [] : [SUPABASE_URL_VAR]),
    ...(key ? [] : SUPABASE_KEY_VARS),
  ];

  if (missingVars.length > 0) {
    throw new SupabaseConfigError(missingVars);
  }

  return { url: url as string, key: key as string };
}

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const { url, key } = getSupabaseEnv();
  cachedClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cachedClient;
}
