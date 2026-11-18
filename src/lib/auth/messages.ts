export const DEFAULT_AUTH_ERROR =
  "No pudimos completar la operación. Inténtalo de nuevo en unos minutos.";

const AUTH_MESSAGES: Record<string, string> = {
  invalid_credentials:
    "Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.",
  email_not_confirmed:
    "La cuenta aún no está confirmada. Revisa tu correo o confírmala desde Supabase.",
  over_request_rate_limit:
    "Demasiados intentos en poco tiempo. Espera un momento e inténtalo de nuevo.",
  user_banned: "Esta cuenta está deshabilitada.",
  sin_permiso: "Esta cuenta no es la administradora de la biblioteca.",
  no_configurado:
    "El acceso administrativo no está configurado en este entorno.",
};

export function mapAuthError(code: string | undefined): string {
  if (!code) return DEFAULT_AUTH_ERROR;
  return AUTH_MESSAGES[code] ?? DEFAULT_AUTH_ERROR;
}

export interface LoginFields {
  email: string;
  password: string;
}

export interface FieldErrors {
  email?: string;
  password?: string;
}

export function validateLoginFields(fields: LoginFields): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.email.trim()) {
    errors.email = "Escribe tu correo.";
  }
  if (!fields.password) {
    errors.password = "Escribe tu contraseña.";
  }

  return errors;
}

export function safeInternalRedirect(
  value: string | null | undefined
): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return undefined;
  if (trimmed.startsWith("//")) return undefined;
  if (trimmed.startsWith("/\\")) return undefined;
  if (/[<>"]/.test(trimmed)) return undefined;
  if (trimmed.length > 200) return undefined;

  return trimmed;
}

export function safeAdminRedirect(value: string | null | undefined): string {
  const target = safeInternalRedirect(value);
  if (!target) return "/admin/partituras";
  if (!/^\/admin(?:\/|$)/.test(target)) return "/admin/partituras";
  if (/^\/admin\/login(?:[/?#]|$)/.test(target)) return "/admin/partituras";
  return target;
}
