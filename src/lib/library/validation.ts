import { LibraryError } from "./errors";

export const MAX_FOLDER_NAME_LENGTH = 80;
export const MAX_SCORE_TITLE_LENGTH = 160;
export const MAX_FILENAME_LENGTH = 255;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function normalizeFolderName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateFolderName(rawName: string): string {
  const name = rawName.replace(/\s+/g, " ").trim();

  if (!name) {
    throw new LibraryError("FOLDER_EMPTY", "Escribe un nombre para la carpeta.");
  }
  if (name.length > MAX_FOLDER_NAME_LENGTH) {
    throw new LibraryError(
      "FOLDER_TOO_LONG",
      `El nombre de la carpeta no puede superar ${MAX_FOLDER_NAME_LENGTH} caracteres.`
    );
  }

  return name;
}

export function validateScoreTitle(rawTitle: string): string {
  const title = rawTitle.replace(/\s+/g, " ").trim();

  if (!title) {
    throw new LibraryError("TITLE_EMPTY", "Escribe un nombre visible.");
  }
  if (title.length > MAX_SCORE_TITLE_LENGTH) {
    throw new LibraryError(
      "TITLE_TOO_LONG",
      `El nombre visible no puede superar ${MAX_SCORE_TITLE_LENGTH} caracteres.`
    );
  }

  return title;
}

export function parseFolderId(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const id = value.trim().toLowerCase();
  if (!isUuid(id)) {
    throw new LibraryError("INVALID_FOLDER", "La carpeta seleccionada no es válida.");
  }
  return id;
}

export function validateScoreId(rawId: string): string {
  const id = rawId.trim().toLowerCase();
  if (!isUuid(id)) {
    throw new LibraryError("SCORE_NOT_FOUND", "La partitura indicada no existe.");
  }
  return id;
}

export function validateFolderId(rawId: string): string {
  const id = rawId.trim().toLowerCase();
  if (!isUuid(id)) {
    throw new LibraryError("FOLDER_NOT_FOUND", "La carpeta indicada no existe.");
  }
  return id;
}

export function sanitizeOriginalFilename(rawName: string): string {
  const base = rawName.split(/[\\/]/).pop() ?? "";
  const clean = base
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_FILENAME_LENGTH);

  return clean || "partitura.pdf";
}

export function sanitizeDownloadFilename(title: string): string {
  const clean = title
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "")
    .slice(0, 120);

  const base = clean || "partitura";
  return /\.pdf$/i.test(base) ? base : `${base}.pdf`;
}
