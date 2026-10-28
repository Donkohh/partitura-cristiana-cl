import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, FileClock } from "lucide-react";
import { ArrangementCard } from "@/components/arrangement-card";
import { ScoreLines } from "@/components/score-lines";
import { WorkCard } from "@/components/work-card";
import {
  demoWorks,
  getArrangementsForWork,
  getCollectionsForArrangement,
  getRelatedWorks,
  getWorkById,
} from "@/data/demo-catalog";
import type { Collection } from "@/types/music";

export function generateStaticParams() {
  return demoWorks.map((work) => ({ id: work.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/obras/[id]">): Promise<Metadata> {
  const { id } = await params;
  const work = getWorkById(id);

  if (!work) {
    return { title: "Obra no encontrada" };
  }

  return {
    title: work.title,
    description: work.historicalNotes,
  };
}

export default async function WorkPage({ params }: PageProps<"/obras/[id]">) {
  const { id } = await params;
  const work = getWorkById(id);

  if (!work) {
    notFound();
  }

  const arrangements = getArrangementsForWork(work.id);
  const relatedWorks = getRelatedWorks(work.id);
  const workIndex = demoWorks.findIndex((item) => item.id === work.id);
  const collectionMap = new Map<string, Collection>();

  for (const arrangement of arrangements) {
    for (const collection of getCollectionsForArrangement(arrangement)) {
      collectionMap.set(collection.id, collection);
    }
  }

  const collections = Array.from(collectionMap.values());

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-card/35">
        <ScoreLines className="pointer-events-none absolute -right-24 -top-6 hidden w-[38rem] text-petrol-900 opacity-[0.05] lg:block" />
        <div className="relative mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
          <nav
            aria-label="Ruta de navegación"
            className="flex flex-wrap items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            <Link href="/" className="transition-colors hover:text-foreground">
              Inicio
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href="/catalogo"
              className="transition-colors hover:text-foreground"
            >
              Catálogo
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">{work.title}</span>
          </nav>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem] lg:items-start">
            <div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-gold-600">
                Obra {String(workIndex + 1).padStart(2, "0")} · Ficha de archivo
              </p>
              <h1 className="mt-4 max-w-[15ch] font-serif text-5xl leading-[0.94] tracking-[-0.055em] md:text-6xl lg:text-7xl">
                {work.title}
              </h1>
              {work.subtitle ? (
                <p className="mt-3 font-serif text-xl italic text-muted-foreground">
                  {work.subtitle}
                </p>
              ) : null}

              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                {work.historicalNotes}
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/colecciones/${collection.slug}`}
                    className="border border-border bg-card px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                  >
                    {collection.name}
                  </Link>
                ))}
              </div>
            </div>

            <aside className="border-l border-border pl-6 lg:sticky lg:top-28">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-gold-600">
                Datos de la obra
              </p>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Composición
                  </dt>
                  <dd className="mt-1 leading-6">
                    {work.originalComposer ?? "Autoría tradicional"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Texto
                  </dt>
                  <dd className="mt-1 leading-6">
                    {work.lyricist ?? "Texto tradicional"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Idioma original
                  </dt>
                  <dd className="mt-1 leading-6">
                    {work.originalLanguage ?? "No consignado"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Versiones
                  </dt>
                  <dd className="mt-1 leading-6">
                    {arrangements.length}{" "}
                    {arrangements.length === 1 ? "arreglo" : "arreglos"} en el
                    archivo
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-gold-600">
              Versiones disponibles
            </p>
            <h2 className="mt-2 font-serif text-3xl tracking-[-0.03em] md:text-4xl">
              Elige la escritura para tu coro
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Volver al catálogo
          </Link>
        </div>

        <div className="mt-6 flex items-start gap-3 border border-gold-500/30 bg-gold-300/15 p-4 text-sm leading-6 text-muted-foreground">
          <FileClock
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-gold-600"
          />
          <p>
            <span className="font-semibold text-foreground">
              Edición de demostración.
            </span>{" "}
            La visualización y la descarga segura de los archivos se
            habilitarán en la siguiente etapa del archivo.
          </p>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {arrangements.map((arrangement) => (
            <ArrangementCard
              key={arrangement.id}
              arrangement={arrangement}
            />
          ))}
        </div>
      </section>

      {relatedWorks.length > 0 ? (
        <section className="border-t border-border bg-card/35">
          <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-gold-600">
                  Sigue recorriendo
                </p>
                <h2 className="mt-2 font-serif text-3xl tracking-[-0.03em] md:text-4xl">
                  También en el archivo
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:text-gold-600"
              >
                Ver todas las obras
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {relatedWorks.map((entry, index) => (
                <WorkCard key={entry.work.id} entry={entry} index={index} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
