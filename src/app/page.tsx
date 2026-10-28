import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { CollectionCard } from "@/components/collection-card";
import { ScoreLines } from "@/components/score-lines";
import { SectionHeading } from "@/components/section-heading";
import { WorkCard } from "@/components/work-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  catalogStats,
  demoCatalogEntries,
  demoCollections,
  getCollectionStats,
} from "@/data/demo-catalog";
import type { CatalogEntry } from "@/data/demo-catalog";
import { MAX_SEARCH_QUERY_LENGTH } from "@/lib/catalog-search";

const selectedWorkIds = [
  "cuan-grande-es-el",
  "noche-de-paz",
  "ven-emmanuel",
];

const selectedWorks = selectedWorkIds
  .map((id) => demoCatalogEntries.find((entry) => entry.work.id === id))
  .filter((entry): entry is CatalogEntry => entry !== undefined);

const quickVoicings = ["SATB", "SSAA", "TTBB", "SAB"];

const archivePrinciples = [
  {
    number: "01",
    title: "Repertorio cuidado",
    description:
      "Cada obra se presenta con sus datos de autoría, contexto y versiones disponibles.",
  },
  {
    number: "02",
    title: "Versiones para cada coro",
    description:
      "Formaciones grandes, pequeñas o voces blancas encuentran una escritura posible.",
  },
  {
    number: "03",
    title: "Memoria y contexto",
    description:
      "La partitura no está sola: importa de dónde viene y cómo se ha cantado.",
  },
  {
    number: "04",
    title: "Acceso responsable",
    description:
      "La descarga protegida y los permisos de uso se incorporarán en la siguiente etapa.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-petrol-950 text-paper">
        <div className="grain-dark pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -left-40 top-10 size-[34rem] rounded-full bg-gold-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-px bg-paper/10" />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-5 pb-32 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pb-36 lg:pt-24">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gold-400" />
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-gold-300">
                Archivo coral chileno
              </p>
            </div>

            <h1 className="mt-7 max-w-[11ch] font-serif text-[clamp(3.25rem,7.2vw,6.45rem)] leading-[0.88] tracking-[-0.06em]">
              La memoria de un pueblo también se canta.
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-paper/65 md:text-lg">
              Un archivo vivo para reunir partituras, versiones y relatos del
              repertorio coral de las iglesias chilenas. Para volver a cantar lo
              que nos forma.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-none bg-gold-400 px-6 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-petrol-950 hover:bg-gold-300"
              >
                <Link href="/catalogo">
                  Explorar el catálogo
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Link
                href="/colecciones"
                className="inline-flex h-12 items-center gap-2 border border-paper/20 px-5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-paper/80 transition-colors hover:border-paper/40 hover:bg-paper/5 hover:text-paper"
              >
                Ver colecciones
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-paper/15 pt-6">
              <div>
                <dt className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-paper/55">
                  Obras
                </dt>
                <dd className="mt-2 font-serif text-3xl text-gold-300">
                  {catalogStats.works}
                </dd>
              </div>
              <div>
                <dt className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-paper/55">
                  Versiones
                </dt>
                <dd className="mt-2 font-serif text-3xl text-gold-300">
                  {catalogStats.arrangements}
                </dd>
              </div>
              <div>
                <dt className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-paper/55">
                  Colecciones
                </dt>
                <dd className="mt-2 font-serif text-3xl text-gold-300">
                  {catalogStats.collections}
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-[31rem] lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden border border-paper/15 bg-petrol-900">
              <Image
                src="/images/coro.jpg"
                alt="Coro mixto ensayando frente a su director, con partituras en la mano"
                fill
                priority
                sizes="(min-width: 1024px) 42vw, (min-width: 640px) 70vw, 90vw"
                className="object-cover object-center opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-petrol-950 via-petrol-950/20 to-transparent" />
              <div className="absolute right-5 top-5 border border-paper/20 bg-petrol-950/60 px-3 py-2 text-[0.52rem] font-semibold uppercase tracking-[0.18em] text-paper/60 backdrop-blur-sm">
                Fotografía · Pexels
              </div>
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-gold-300">
                  Del archivo
                </p>
                <p className="mt-1 font-serif text-xl text-paper/90">
                  Noche de paz
                </p>
              </div>
            </div>

            <figure className="absolute -bottom-12 -left-4 w-[72%] rotate-[-2deg] border border-petrol-900/10 bg-paper p-5 text-petrol-950 shadow-editorial sm:-left-8 sm:w-[64%]">
              <div className="flex items-center justify-between text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-petrol-900/55">
                <span>Donko · archivo</span>
                <span>Nº 01</span>
              </div>
              <figcaption className="mt-5">
                <p className="font-serif text-2xl leading-none">
                  Cuán grande es él
                </p>
                <p className="mt-2 text-[0.54rem] font-semibold uppercase tracking-[0.16em] text-petrol-900/50">
                  Himno · SATB · Piano
                </p>
              </figcaption>
              <ScoreLines className="mt-4" />
              <div className="mt-2 flex items-center justify-between border-t border-petrol-900/15 pt-2 text-[0.48rem] font-semibold uppercase tracking-[0.16em] text-petrol-900/55">
                <span>4:10</span>
                <span>Si bemol mayor</span>
              </div>
            </figure>

            <p className="absolute -right-1 top-1/2 hidden text-[0.52rem] font-semibold uppercase tracking-[0.32em] text-paper/45 [writing-mode:vertical-rl] xl:block">
              Archivo vivo · Chile
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-10 pb-20 lg:-mt-14">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="border border-border bg-card p-6 shadow-editorial md:p-8">
            <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-gold-600">
                  Buscar en el archivo
                </p>
                <h2 className="mt-2 font-serif text-3xl tracking-[-0.03em]">
                  ¿Qué obra necesita tu coro?
                </h2>
              </div>

              <form
                action="/catalogo"
                method="get"
                role="search"
                aria-label="Buscar en el archivo"
                className="flex flex-col gap-3 sm:flex-row"
              >
                <div className="relative flex-1">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <label htmlFor="home-search" className="sr-only">
                    Buscar por título, compositor o formación
                  </label>
                  <Input
                    id="home-search"
                    name="q"
                    type="search"
                    maxLength={MAX_SEARCH_QUERY_LENGTH}
                    placeholder="Título, compositor o formación..."
                    className="h-12 rounded-none border-border bg-background pl-11 text-base shadow-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 rounded-none bg-primary px-6 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-petrol-800"
                >
                  Buscar
                </Button>
              </form>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/80 pt-4">
              <span className="mr-1 text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Por formación
              </span>
              {quickVoicings.map((voicing) => (
                <Link
                  key={voicing}
                  href={`/catalogo?voz=${encodeURIComponent(voicing)}`}
                  className="border border-border px-2.5 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  {voicing}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-28">
        <SectionHeading
          eyebrow="Para comenzar"
          title="Una primera selección"
          description="Tres obras para entrar al archivo, escuchar su historia y descubrir las versiones disponibles."
          action={
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:text-gold-600"
            >
              Ver todo el catálogo
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          }
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {selectedWorks.map((entry, index) => (
            <WorkCard key={entry.work.id} entry={entry} index={index} />
          ))}
        </div>
      </section>

      <section id="colecciones" className="border-y border-border bg-card/35">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <SectionHeading
            eyebrow="Cuatro puertas de entrada"
            title="Colecciones con igual presencia"
            description="El archivo se organiza en recorridos, no en jerarquías. Cada colección tiene su propio carácter y su propia memoria."
            action={
              <Link
                href="/colecciones"
                className="inline-flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:text-gold-600"
              >
                Recorrer colecciones
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            }
          />

          <div className="mt-10 border-b border-border">
            {demoCollections.map((collection, index) => {
              const stats = getCollectionStats(collection.id);

              return (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  index={index}
                  works={stats.works}
                  arrangements={stats.arrangements}
                />
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="archivo"
        className="mx-auto grid max-w-7xl gap-16 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:py-28"
      >
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden border border-border bg-paper-deep">
            <Image
              src="/images/partitura.jpg"
              alt="Partitura abierta sobre un atril, con las líneas del pentagrama en primer plano"
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-petrol-950/35 to-transparent" />
          </div>
          <blockquote className="absolute -bottom-7 -right-3 max-w-[16rem] bg-gold-400 p-5 text-petrol-950 shadow-editorial sm:-right-6">
            <p className="font-serif text-2xl leading-[1.08] tracking-[-0.03em]">
              “Cantar es recordar juntos.”
            </p>
            <footer className="mt-4 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-petrol-900/60">
              Cuaderno de archivo
            </footer>
          </blockquote>
        </div>

        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-gold-600">
            El archivo
          </p>
          <h2 className="mt-3 max-w-[15ch] font-serif text-4xl leading-[1.02] tracking-[-0.04em] md:text-5xl">
            Una partitura no termina en el papel.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
            Detrás de cada obra hay una comunidad que la cantó, un director que
            la eligió y una historia que merece seguir circulando. Este archivo
            reúne ese repertorio con cuidado editorial y una mirada
            contemporánea.
          </p>

          <div className="mt-9 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {archivePrinciples.map((principle) => (
              <div key={principle.number} className="border-t border-border pt-4">
                <p className="text-[0.56rem] font-semibold uppercase tracking-[0.22em] text-gold-600">
                  {principle.number}
                </p>
                <h3 className="mt-2 font-serif text-xl tracking-[-0.02em]">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/catalogo"
            className="mt-9 inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:text-gold-600"
          >
            Recorrer el archivo
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-28">
        <div className="relative overflow-hidden bg-petrol-900 px-6 py-12 text-paper md:px-12 md:py-16">
          <div className="grain-dark pointer-events-none absolute inset-0 opacity-35" />
          <ScoreLines className="pointer-events-none absolute -right-20 top-1/2 hidden w-[34rem] -translate-y-1/2 text-paper opacity-10 md:block" />
          <div className="relative max-w-2xl">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-gold-300">
              Empieza a explorar
            </p>
            <h2 className="mt-4 max-w-[16ch] font-serif text-4xl leading-[0.98] tracking-[-0.04em] md:text-5xl">
              Cada coro tiene una obra esperando ser cantada.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-paper/60 md:text-base">
              Recorre el catálogo por título, compositor, formación o colección.
              La primera versión del archivo ya está abierta.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-7 h-12 rounded-none bg-gold-400 px-6 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-petrol-950 hover:bg-gold-300"
            >
              <Link href="/catalogo">
                Entrar al catálogo
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
