"use client";

import { useMemo, useState } from "react";
import { formatBytes } from "@/lib/library/pdf";
import {
  filterAndSortScores,
  MAX_SEARCH_QUERY_LENGTH,
  sanitizeSearchQuery,
} from "@/lib/library/text";
import type { LibraryFolder, LibraryScore } from "@/lib/library/types";

interface LibraryBrowserProps {
  folders: LibraryFolder[];
  scores: LibraryScore[];
}

const ALL_FOLDERS = "todas";
const NO_FOLDER = "sin-carpeta";

export function LibraryBrowser({ folders, scores }: LibraryBrowserProps) {
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState(ALL_FOLDERS);

  const visibleScores = useMemo(() => {
    const byFolder = scores.filter((score) => {
      if (folder === ALL_FOLDERS) return true;
      if (folder === NO_FOLDER) return score.folderId === null;
      return score.folderId === folder;
    });

    return filterAndSortScores(byFolder, query);
  }, [folder, query, scores]);

  const total = scores.length;

  return (
    <section aria-labelledby="biblioteca" className="pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="biblioteca" className="sr-only">
            Biblioteca
          </h2>
          <p className="text-sm text-ink-soft" aria-live="polite">
            {visibleScores.length} de {total} partitura
            {total === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon />
            <label htmlFor="buscar-partitura" className="sr-only">
              Buscar partitura
            </label>
            <input
              id="buscar-partitura"
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(sanitizeSearchQuery(event.target.value))
              }
              maxLength={MAX_SEARCH_QUERY_LENGTH}
              placeholder="Buscar por nombre..."
              className="h-10 w-full border border-line bg-white pl-9 pr-3 text-sm placeholder:text-ink-soft/70"
            />
          </div>

          <label className="sr-only" htmlFor="filtrar-carpeta">
            Filtrar por carpeta
          </label>
          <select
            id="filtrar-carpeta"
            value={folder}
            onChange={(event) => setFolder(event.target.value)}
            className="h-10 w-full border border-line bg-white px-3 text-sm sm:w-48"
          >
            <option value={ALL_FOLDERS}>Todas las carpetas</option>
            <option value={NO_FOLDER}>Sin carpeta</option>
            {folders.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visibleScores.length === 0 ? (
        <p className="mt-10 border border-dashed border-line bg-white/60 px-5 py-12 text-center text-sm text-ink-soft">
          {total === 0
            ? "Todavía no hay partituras subidas."
            : "No hay partituras que coincidan con la búsqueda."}
        </p>
      ) : (
        <ol className="mt-6 divide-y divide-line border-y border-line">
          {visibleScores.map((score) => (
            <li
              key={score.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-serif text-lg leading-snug">
                  {score.title}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
                  <span>{score.folderName ?? "Sin carpeta"}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatBytes(score.sizeBytes)}</span>
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={`/api/partituras/${score.id}/ver`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center border border-line bg-white px-3 text-sm font-medium transition-colors hover:border-moss hover:text-moss"
                >
                  Abrir
                </a>
                <a
                  href={`/api/partituras/${score.id}/descargar`}
                  className="inline-flex h-9 items-center bg-moss px-3 text-sm font-medium text-paper transition-colors hover:bg-ink"
                >
                  Descargar
                </a>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 4 4" strokeLinecap="round" />
    </svg>
  );
}
