import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { ScoreLines } from "@/components/score-lines";
import { WorkCard } from "@/components/work-card";
import {
  demoCollections,
  getCollectionBySlug,
  getCollectionEntries,
  getCollectionStats,
} from "@/data/demo-catalog";

export function generateStaticParams() {
  return demoCollections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/colecciones/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return { title: "Colección no encontrada" };
  }

  return {
    title: collection.name,
    description: collection.shortDescription,
  };
}

export default async function CollectionPage({
  params,
}: PageProps<"/colecciones/[slug]">) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const collectionEntries = getCollectionEntries(collection.id);
  const stats = getCollectionStats(collection.id);
  const collectionIndex = demoCollections.findIndex(
    (item) => item.id === collection.id
  );
  const otherCollections = demoCollections.filter(
    (item) => item.id !== collection.id
  );

  const cards = collectionEntries.map((entry) => ({
    work: entry.work,
    arrangements: entry.matchingArrangements,
  }));

  return (
    <>
      <section className="relative overflow-hidden bg-petrol-950 text-paper">
        <div className="grain-dark pointer-events-none absolute inset-0 opacity-40" />
        <ScoreLines className="pointer-events-none absolute -right-24 top-1/2 hidden w-[46rem] -translate-y-1/2 text-paper opacity-10 lg:block" />
        <div className="relative mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20">
          <nav
            aria-label="Ruta de navegación"
            className="flex flex-wrap items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-paper/60"
          >
            <Link href="/" className="transition-colors hover:text-paper">
              Inicio
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href="/colecciones"
              className="transition-colors hover:text-paper"
            >
              Colecciones
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-paper/80">{collection.name}</span>
          </nav>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_20rem] lg:items-end">
            <div>
              <div className="flex items-center gap-4">
                <span className="font-serif text-6xl leading-none text-gold-400/80">
                  {String(collectionIndex + 1).padStart(2, "0")}
                </span>
                <span className="h-px w-12 bg-paper/20" />
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-gold-300">
                  {collection.kicker}
                </p>
              </div>

              <h1 className="mt-6 max-w-[14ch] font-serif text-5xl leading-[0.94] tracking-[-0.055em] md:text-6xl lg:text-7xl">
                {collection.name}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-paper/65 md:text-lg">
                {collection.fullDescription}
              </p>
            </div>

            <div className="border-l border-paper/15 pl-6">
              <p className="text-[0.56rem] font-semibold uppercase tracking-[0.24em] text-paper/55">
                En esta colección
              </p>
              <dl className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <dt className="text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-paper/55">
                    Obras
                  </dt>
                  <dd className="mt-1 font-serif text-3xl text-gold-300">
                    {stats.works}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-paper/55">
                    Versiones
                  </dt>
                  <dd className="mt-1 font-serif text-3xl text-gold-300">
                    {stats.arrangements}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-paper/55">
                    Formaciones
                  </dt>
                  <dd className="mt-1 font-serif text-3xl text-gold-300">
                    {stats.voicings}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-gold-600">
              Obras de la colección
            </p>
            <h2 className="mt-2 font-serif text-3xl tracking-[-0.03em] md:text-4xl">
              Un recorrido por {collection.name}
            </h2>
          </div>
          <Link
            href="/colecciones"
            className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Todas las colecciones
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((entry, index) => (
            <WorkCard key={entry.work.id} entry={entry} index={index} />
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card/35">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-gold-600">
                Seguir recorriendo
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.03em] md:text-4xl">
                Otras puertas del archivo
              </h2>
            </div>
            <Link
              href="/colecciones"
              className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:text-gold-600"
            >
              Ver todas
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-3">
            {otherCollections.map((item) => (
              <Link
                key={item.id}
                href={`/colecciones/${item.slug}`}
                className="group flex items-center justify-between gap-4 bg-background p-5 transition-colors hover:bg-card"
              >
                <div>
                  <p className="text-[0.52rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {String(item.order).padStart(2, "0")}
                  </p>
                  <p className="mt-1 font-serif text-xl tracking-[-0.02em]">
                    {item.name}
                  </p>
                </div>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
