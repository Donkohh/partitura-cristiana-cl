import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-petrol-950 text-paper">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_0.8fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center border border-paper/20 font-serif text-2xl leading-none text-gold-300">
                p
              </span>
              <div className="flex flex-col">
                <span className="font-serif text-xl leading-none">Partituras</span>
                <span className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.32em] text-paper/60">
                  Cristianas Chile
                </span>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-7 text-paper/60">
              Un archivo vivo para cuidar, estudiar y volver a cantar la memoria
              coral de las iglesias chilenas.
            </p>
          </div>

          <nav aria-label="Enlaces del archivo" className="text-sm">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-gold-300/80">
              Archivo
            </p>
            <div className="mt-4 flex flex-col gap-3 text-paper/65">
              <Link
                href="/catalogo"
                className="transition-colors hover:text-paper"
              >
                Catálogo de obras
              </Link>
              <Link
                href="/colecciones"
                className="transition-colors hover:text-paper"
              >
                Colecciones
              </Link>
              <Link href="/#archivo" className="transition-colors hover:text-paper">
                Sobre el proyecto
              </Link>
            </div>
          </nav>

          <div className="border-l border-paper/10 pl-6 md:pl-8">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-gold-300/80">
              Primera versión
            </p>
            <p className="mt-4 text-sm leading-7 text-paper/60">
              Este recorrido usa un catálogo de demostración. La descarga segura
              de partituras y la gestión de permisos se incorporarán en la
              siguiente etapa.
            </p>
            <Link
              href="/catalogo"
              className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold-300 transition-colors hover:text-paper"
            >
              Entrar al catálogo
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-paper/10 pt-6 text-[0.65rem] uppercase tracking-[0.16em] text-paper/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Partituras Cristianas Chile</p>
          <p>Fotografías: Pexels · Hecho en Chile</p>
        </div>
      </div>
    </footer>
  );
}
