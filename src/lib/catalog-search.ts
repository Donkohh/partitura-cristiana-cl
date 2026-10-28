import type { Arrangement, Work } from "../types/music";

export const MAX_SEARCH_QUERY_LENGTH = 120;

export interface SearchableEntry {
  work: Work;
  arrangements: Arrangement[];
}

export interface CatalogFilters {
  query?: string;
  voicing?: string;
  collectionId?: string;
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeSearchQuery(value: string | null | undefined): string {
  if (!value) return "";

  const sanitized = value
    .slice(0, MAX_SEARCH_QUERY_LENGTH * 2)
    .replace(/[^\p{L}\p{N}\s'’.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  return Array.from(sanitized).slice(0, MAX_SEARCH_QUERY_LENGTH).join("");
}

function scoreTextMatch(
  value: string | undefined,
  term: string,
  weights: { exact: number; prefix: number; includes: number }
): number {
  if (!value) return 0;
  const normalized = normalizeSearchText(value);

  if (normalized === term) return weights.exact;
  if (normalized.startsWith(term)) return weights.prefix;
  if (normalized.includes(term)) return weights.includes;
  return 0;
}

export function scoreWorkMatch(work: Work, query: string): number {
  const term = normalizeSearchText(query);
  if (!term) return 0;

  return Math.max(
    scoreTextMatch(work.title, term, {
      exact: 1000,
      prefix: 900,
      includes: 800,
    }),
    scoreTextMatch(work.subtitle, term, {
      exact: 760,
      prefix: 700,
      includes: 640,
    }),
    scoreTextMatch(work.originalComposer, term, {
      exact: 560,
      prefix: 520,
      includes: 470,
    }),
    scoreTextMatch(work.lyricist, term, {
      exact: 420,
      prefix: 380,
      includes: 340,
    }),
    scoreTextMatch(work.historicalNotes, term, {
      exact: 180,
      prefix: 150,
      includes: 120,
    })
  );
}

export function scoreArrangementMatch(
  arrangement: Arrangement,
  query: string
): number {
  const term = normalizeSearchText(query);
  if (!term) return 0;

  return Math.max(
    scoreTextMatch(arrangement.title, term, {
      exact: 680,
      prefix: 620,
      includes: 560,
    }),
    scoreTextMatch(arrangement.arranger, term, {
      exact: 460,
      prefix: 420,
      includes: 380,
    }),
    scoreTextMatch(arrangement.voicing, term, {
      exact: 300,
      prefix: 260,
      includes: 220,
    }),
    scoreTextMatch(arrangement.accompaniment, term, {
      exact: 260,
      prefix: 220,
      includes: 180,
    })
  );
}

export function workMatchesQuery(work: Work, query: string): boolean {
  return scoreWorkMatch(work, query) > 0;
}

export function arrangementMatchesFilters(
  arrangement: Arrangement,
  filters: CatalogFilters
): boolean {
  if (filters.voicing && arrangement.voicing !== filters.voicing) {
    return false;
  }

  if (
    filters.collectionId &&
    !arrangement.collectionIds.includes(filters.collectionId)
  ) {
    return false;
  }

  return true;
}

function scoreEntry(entry: SearchableEntry, query: string): number {
  const workScore = scoreWorkMatch(entry.work, query);
  const arrangementScore = Math.max(
    0,
    ...entry.arrangements.map((arrangement) =>
      scoreArrangementMatch(arrangement, query)
    )
  );

  return Math.max(workScore, arrangementScore);
}

export function searchCatalog<T extends SearchableEntry>(
  entries: T[],
  filters: CatalogFilters = {}
): T[] {
  const query = sanitizeSearchQuery(filters.query);
  const term = normalizeSearchText(query);
  const hasArrangementFilter = Boolean(
    filters.voicing || filters.collectionId
  );

  return entries
    .map((entry) => ({
      ...entry,
      arrangements: entry.arrangements.filter((arrangement) =>
        arrangementMatchesFilters(arrangement, filters)
      ),
    }))
    .filter((entry) => {
      if (hasArrangementFilter && entry.arrangements.length === 0) {
        return false;
      }

      if (!term) return true;

      return (
        scoreWorkMatch(entry.work, term) > 0 ||
        entry.arrangements.some(
          (arrangement) => scoreArrangementMatch(arrangement, term) > 0
        )
      );
    })
    .sort((a, b) => {
      if (term) {
        const difference = scoreEntry(b, term) - scoreEntry(a, term);
        if (difference !== 0) return difference;
      }

      return normalizeSearchText(a.work.title).localeCompare(
        normalizeSearchText(b.work.title),
        "es"
      );
    });
}
