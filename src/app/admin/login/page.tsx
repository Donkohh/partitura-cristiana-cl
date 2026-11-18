import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { cerrarSesionSinPermiso } from "@/lib/auth/actions";
import {
  getAdminPolicy,
  getSessionUser,
  userIsAdmin,
} from "@/lib/auth/admin";
import { mapAuthError, safeAdminRedirect } from "@/lib/auth/messages";

export const metadata: Metadata = {
  title: "Acceso al panel",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirigirA = safeAdminRedirect(firstValue(params.redirigirA));
  const errorCode = firstValue(params.error);
  const user = await getSessionUser();

  if (user && userIsAdmin(user)) {
    redirect(redirigirA);
  }

  const configured = getAdminPolicy() !== null;

  return (
    <div className="mx-auto flex max-w-sm flex-col px-5 py-20 sm:px-8">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
        Donko Partituras
      </p>
      <h1 className="mt-2 font-serif text-3xl tracking-tight">Panel privado</h1>

      {!configured ? (
        <p className="mt-6 border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
          El acceso no está configurado en este entorno. Falta la variable
          ADMIN_EMAIL.
        </p>
      ) : user ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm leading-6 text-ink-soft">
            La sesión iniciada con {user.email} no tiene acceso al panel.
          </p>
          <form action={cerrarSesionSinPermiso}>
            <button
              type="submit"
              className="h-9 border border-line bg-white px-3 text-sm font-medium transition-colors hover:border-moss hover:text-moss"
            >
              Cerrar esta sesión
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-6">
          {errorCode ? (
            <p className="mb-4 border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
              {mapAuthError(errorCode)}
            </p>
          ) : null}
          <LoginForm redirigirA={redirigirA} />
        </div>
      )}

      <Link
        href="/"
        className="mt-8 text-xs text-ink-soft underline decoration-line underline-offset-4 hover:text-ink"
      >
        Volver a la biblioteca
      </Link>
    </div>
  );
}
