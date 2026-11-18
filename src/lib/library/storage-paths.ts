import { LibraryError } from "./errors";
import { isUuid } from "./validation";

export const SCORE_BUCKET = "score-files";
export const SIGNED_URL_TTL_SECONDS = 300;

export function buildScoreStoragePath(
  scoreId: string,
  objectId: string = scoreId
): string {
  if (!isUuid(scoreId) || !isUuid(objectId)) {
    throw new LibraryError(
      "INCONSISTENT_RECORD",
      "No pudimos generar una ruta de almacenamiento segura."
    );
  }

  return `scores/${scoreId.toLowerCase()}/${objectId.toLowerCase()}.pdf`;
}

export function isScoreStoragePath(path: string): boolean {
  return /^scores\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.pdf$/i.test(path);
}
