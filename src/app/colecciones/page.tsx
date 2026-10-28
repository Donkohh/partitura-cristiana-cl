import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  demoCollections,
  getCollectionStats,
} from "@/data/demo-catalog";

export const metadata: Metadata = {
  title: "Colecciones",
  description:
    "Cuatro recorridos por el archivo coral: himnario tradicional, voces mixtas, polifonía sacra y Adviento.",
};

export default function CollectionsPage() {
  return (
    <>
      <section className="border-b border-border bg-card/35">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-gold-500" />
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-gold-600">
              Recorridos del archivo
            </p>
          </div>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end">
            <h1 className="max-w-[13ch] font-serif text-5xl leading-[0.94] tracking-[-0.05em] md:text-6xl">
              Cuatro recorridos, una misma memoria.
            </h1>
            <p className="border-l border-border pl-6 text-sm leading-7 text-muted-foreground">
              Las colecciones no compiten entre sí. Son puertas distintas para
              entrar a un mismo archivo: la asamblea, el ensayo, el concierto y
              el tiempo de la espera.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
          {demoCollections.map((collection, index) => {
            const stats = getCollectionStats(collection.id);

            return (
              <Link
                key={collection.id}
                href={`/colecciones/${collection.slug}`}
                className="group relative flex min-h-[22rem] flex-col bg-background p-7 transition-colors hover:bg-card md:p-9"
              >
                <div className="flex items-start justify-between">
                  <span className="font-serif text-5xl leading-none text-gold-500/80 transition-colors group-hover:text-gold-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-5 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                  />
                </div>

                <div className="mt-8">
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {collection.kicker}
                  </p>
                  <h2 className="mt-2 font-serif text-3xl leading-tight tracking-[-0.03em]">
                    {collection.name}
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                    {collection.shortDescription}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-border/80 pt-4 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <span>
                    {stats.works} {stats.works === 1 ? "obra" : "obras"} ·{" "}
                    {stats.arrangements}{" "}
                    {stats.arrangements === 1 ? "versión" : "versiones"}
                  </span>
                  <span className="text-gold-600">Abrir colección</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-6 border-l-2 border-gold-400 pl-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl font-serif text-xl leading-8 text-muted-foreground">
            ¿No sabes por dónde empezar? Busca por formación y deja que el
            catálogo te muestre las versiones posibles.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex shrink-0 items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:text-gold-600"
          >
            Ir al catálogo
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
