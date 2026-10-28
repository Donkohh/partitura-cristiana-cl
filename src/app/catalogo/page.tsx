import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ChevronDown, Search, SearchX, X } from "lucide-react";
import { WorkCard } from "@/components/work-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  demoCatalogEntries,
  demoCollections,
  VOICING_OPTIONS,
} from "@/data/demo-catalog";
import {
  MAX_SEARCH_QUERY_LENGTH,
  sanitizeSearchQuery,
  searchCatalog,
} from "@/lib/catalog-search";
import type { Voicing } from "@/types/music";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Explora obras, compositores, formaciones y colecciones del archivo coral de Partituras Cristianas Chile.",
};

type CatalogSearchParams = PageProps<"/catalogo">["searchParams"];

function CatalogHero() {
  return (
    <section className="border-b border-border bg-card/35">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-gold-500" />
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-gold-600">
            Catálogo abierto
          </p>
        </div>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <h1 className="max-w-[14ch] font-serif text-5xl leading-[0.94] tracking-[-0.05em] md:text-6xl">
              Todas las obras, todas las voces.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              Busca por título, compositor, formación o colección. Cada ficha
              reúne las versiones disponibles y el contexto de la obra.
            </p>
          </div>

          <div className="border-l border-border pl-6 text-sm text-muted-foreground">
            <p className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-gold-600">
              En esta edición
            </p>
            <p className="mt-2 font-serif text-2xl text-foreground">
              {demoCatalogEntries.length} obras
            </p>
            <p className="mt-1">
              {demoCatalogEntries.reduce(
                (total, entry) => total + entry.arrangements.length,
                0
              )}{" "}
              versiones para coro
            </p>
            <p className="mt-2 text-xs leading-5">
              Edición de demostración con datos ilustrativos: todavía no hay
              archivos de partitura disponibles para descargar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CatalogFallback() {
  return (
    <section
      aria-busy="true"
      className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16"
    >
      <div className="h-[13.5rem] animate-pulse border border-border bg-card/65" />
      <div className="mt-8 h-8 w-52 animate-pulse bg-muted" />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-72 animate-pulse border border-border bg-card/65"
          />
        ))}
      </div>
      <span className="sr-only">Cargando el catálogo</span>
    </section>
  );
}

async function CatalogBrowser({
  searchParams,
}: {
  searchParams: CatalogSearchParams;
}) {
  const params = await searchParams;
  const queryParam = typeof params.q === "string" ? params.q : "";
  const query = sanitizeSearchQuery(queryParam);
  const voicingParam = typeof params.voz === "string" ? params.voz : "";
  const voicing = VOICING_OPTIONS.includes(voicingParam as Voicing)
    ? voicingParam
    : "";
  const collectionParam =
    typeof params.coleccion === "string" ? params.coleccion : "";
  const collection = demoCollections.find(
    (item) => item.slug === collectionParam
  );

  const results = searchCatalog(demoCatalogEntries, {
    query,
    voicing: voicing || undefined,
    collectionId: collection?.id,
  });

  const totalArrangements = results.reduce(
    (total, entry) => total + entry.arrangements.length,
    0
  );
  const hasFilters = Boolean(query || voicing || collection);

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <div className="border border-border bg-card p-5 md:p-7">
        <form
          action="/catalogo"
          method="get"
          role="search"
          aria-label="Buscar y filtrar el catálogo"
          className="grid gap-4 lg:grid-cols-[1.5fr_0.68fr_1fr_auto] lg:items-end"
        >
          <div>
            <label
              htmlFor="catalog-search"
              className="mb-2 block text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              Buscar
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="catalog-search"
                name="q"
                type="search"
                maxLength={MAX_SEARCH_QUERY_LENGTH}
                defaultValue={query}
                placeholder="Título, compositor, arreglista..."
                className="h-12 rounded-none border-border bg-background pl-10 text-base shadow-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="catalog-voicing"
              className="mb-2 block text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              Formación
            </label>
            <div className="relative">
              <select
                id="catalog-voicing"
                name="voz"
                defaultValue={voicing}
                className="h-12 w-full appearance-none rounded-none border border-border bg-background px-3 pr-10 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/25"
              >
                <option value="">Todas</option>
                {VOICING_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="catalog-collection"
              className="mb-2 block text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              Colección
            </label>
            <div className="relative">
              <select
                id="catalog-collection"
                name="coleccion"
                defaultValue={collection?.slug ?? ""}
                className="h-12 w-full appearance-none rounded-none border border-border bg-background px-3 pr-10 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/25"
              >
                <option value="">Todas</option>
                {demoCollections.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="h-12 rounded-none bg-primary px-6 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-petrol-800"
          >
            Filtrar
          </Button>
        </form>

        {hasFilters ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/80 pt-4 text-xs text-muted-foreground">
            <span className="text-[0.56rem] font-semibold uppercase tracking-[0.2em]">
              Filtros activos
            </span>
            {query ? (
              <span className="border border-border px-2 py-1">“{query}”</span>
            ) : null}
            {voicing ? (
              <span className="border border-border px-2 py-1">{voicing}</span>
            ) : null}
            {collection ? (
              <span className="border border-border px-2 py-1">
                {collection.name}
              </span>
            ) : null}
            <Link
              href="/catalogo"
              className="ml-1 inline-flex items-center gap-1 text-foreground underline-offset-4 hover:underline"
            >
              <X aria-hidden="true" className="size-3.5" />
              Limpiar
            </Link>
          </div>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <p className="font-serif text-2xl tracking-[-0.02em]">
          {results.length}{" "}
          {results.length === 1 ? "obra encontrada" : "obras encontradas"}
        </p>
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {totalArrangements}{" "}
          {totalArrangements === 1 ? "versión" : "versiones"} en el resultado
        </p>
      </div>

      {results.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((entry, index) => (
            <WorkCard key={entry.work.id} entry={entry} index={index} />
          ))}
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <span className="grid size-12 place-items-center border border-border bg-background text-muted-foreground">
            <SearchX aria-hidden="true" className="size-5" />
          </span>
          <h2 className="mt-5 font-serif text-2xl">
            No encontramos obras con esa combinación
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Prueba con otro título, una formación distinta o quita la colección
            seleccionada.
          </p>
          <Button
            asChild
            className="mt-6 rounded-none bg-primary px-5 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground hover:bg-petrol-800"
          >
            <Link href="/catalogo">Limpiar búsqueda</Link>
          </Button>
        </div>
      )}
    </section>
  );
}

export default function CatalogPage({
  searchParams,
}: PageProps<"/catalogo">) {
  return (
    <>
      <CatalogHero />
      <Suspense fallback={<CatalogFallback />}>
        <CatalogBrowser searchParams={searchParams} />
      </Suspense>
    </>
  );
}
