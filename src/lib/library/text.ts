export const MAX_SEARCH_QUERY_LENGTH = 120;

export interface SearchableScore {
  title: string;
  originalFilename: string;
}

export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeSearchQuery(value: string | null | undefined): string {
  if (!value) return "";

  return value
    .slice(0, MAX_SEARCH_QUERY_LENGTH * 2)
    .replace(/[^\p{L}\p{N}\s'’.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SEARCH_QUERY_LENGTH);
}

const collator = new Intl.Collator("es", {
  sensitivity: "base",
  numeric: true,
});

export function compareScoresByTitle(
  a: SearchableScore,
  b: SearchableScore
): number {
  return (
    collator.compare(normalizeForSearch(a.title), normalizeForSearch(b.title)) ||
    collator.compare(
      normalizeForSearch(a.originalFilename),
      normalizeForSearch(b.originalFilename)
    )
  );
}

export function scoreMatchesQuery(
  score: SearchableScore,
  query: string
): boolean {
  const term = normalizeForSearch(query);
  if (!term) return true;

  return (
    normalizeForSearch(score.title).includes(term) ||
    normalizeForSearch(score.originalFilename).includes(term)
  );
}

export function filterAndSortScores<T extends SearchableScore>(
  scores: T[],
  query: string
): T[] {
  return scores
    .filter((score) => scoreMatchesQuery(score, query))
    .sort(compareScoresByTitle);
}
