import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { ScoreLines } from "@/components/score-lines";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-petrol-950 text-paper">
      <div className="grain-dark pointer-events-none absolute inset-0 opacity-40" />
      <ScoreLines className="pointer-events-none absolute -bottom-10 -right-20 w-[42rem] text-paper opacity-10" />
      <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center px-5 py-20 lg:px-8">
        <p className="font-serif text-[clamp(6rem,18vw,14rem)] leading-none text-gold-400/20">
          404
        </p>
        <h1 className="mt-2 max-w-[16ch] font-serif text-4xl leading-[0.98] tracking-[-0.045em] md:text-6xl">
          Esta página no está en el archivo.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-paper/60">
          Puede que el enlace haya cambiado o que la obra todavía no forme parte
          de esta primera edición. Vuelve al catálogo para seguir recorriendo.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            asChild
            className="h-11 rounded-none bg-gold-400 px-5 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-petrol-950 hover:bg-gold-300"
          >
            <Link href="/catalogo">
              <ArrowLeft aria-hidden="true" />
              Ir al catálogo
            </Link>
          </Button>
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 border border-paper/20 px-5 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-paper/75 transition-colors hover:bg-paper/5 hover:text-paper"
          >
            Volver al inicio
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
