import type { Metadata } from "next";
import Link from "next/link";
import { cerrarSesionAdmin } from "@/lib/auth/actions";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: LayoutProps<"/admin">) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-paper-deep/40">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-5">
            <Link href="/admin/partituras" className="font-serif text-lg">
              Donko Partituras
            </Link>
            <nav aria-label="Panel" className="flex items-center gap-4 text-sm">
              <Link
                href="/admin/partituras"
                className="text-ink-soft transition-colors hover:text-ink"
              >
                Partituras
              </Link>
              <Link
                href="/admin/carpetas"
                className="text-ink-soft transition-colors hover:text-ink"
              >
                Carpetas
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 text-xs text-ink-soft">
            <Link href="/" className="hover:text-ink">
              Ver sitio
            </Link>
            <span aria-hidden="true">·</span>
            <span className="hidden sm:inline">{user.email}</span>
            <form action={cerrarSesionAdmin}>
              <button type="submit" className="underline underline-offset-4 hover:text-ink">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">{children}</div>
    </div>
  );
}
