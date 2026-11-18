import { LibraryError } from "./errors";
import {
  computeSha256Hex,
  MAX_PDF_MB,
  validatePdfBytes,
  type PdfValidationReason,
} from "./pdf";
import { buildScoreStoragePath } from "./storage-paths";
import {
  normalizeFolderName,
  sanitizeOriginalFilename,
  validateFolderId,
  validateFolderName,
  validateScoreId,
  validateScoreTitle,
} from "./validation";

export interface FolderRecord {
  id: string;
  name: string;
  normalizedName: string;
  createdAt?: string;
}

export interface ScoreRecord {
  id: string;
  title: string;
  originalFilename: string;
  folderId: string | null;
  storagePath: string;
  sizeBytes: number;
  sha256Hash: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ScorePatch = Partial<
  Pick<
    ScoreRecord,
    | "title"
    | "folderId"
    | "originalFilename"
    | "storagePath"
    | "sizeBytes"
    | "sha256Hash"
  >
>;

export interface LibraryRepository {
  getFolder(id: string): Promise<FolderRecord | null>;
  findFolderByNormalizedName(normalizedName: string): Promise<FolderRecord | null>;
  insertFolder(folder: FolderRecord): Promise<FolderRecord>;
  updateFolder(id: string, name: string, normalizedName: string): Promise<FolderRecord>;
  countScoresInFolder(folderId: string): Promise<number>;
  deleteFolderAndUncategorize(folderId: string, moveScores: boolean): Promise<void>;

  getScore(id: string): Promise<ScoreRecord | null>;
  insertScore(score: ScoreRecord): Promise<void>;
  updateScore(id: string, patch: ScorePatch): Promise<ScoreRecord>;
  deleteScore(id: string): Promise<ScoreRecord | null>;
}

export interface FileStore {
  upload(path: string, bytes: Uint8Array, contentType: string): Promise<void>;
  remove(path: string): Promise<void>;
}

export interface PdfInput {
  bytes: Uint8Array;
  originalFilename: string;
}

export interface OperationResult {
  score: ScoreRecord;
  warning?: string;
}

function pdfError(reason: PdfValidationReason): never {
  switch (reason) {
    case "vacio":
      throw new LibraryError("PDF_EMPTY", "El archivo está vacío.");
    case "demasiado-grande":
      throw new LibraryError(
        "PDF_TOO_LARGE",
        `El PDF supera el límite de ${MAX_PDF_MB} MB.`
      );
    case "sin-cabecera-pdf":
      throw new LibraryError(
        "PDF_INVALID_HEADER",
        "El archivo no es un PDF válido."
      );
    case "sin-cola-eof":
      throw new LibraryError(
        "PDF_INVALID_EOF",
        "El PDF está incompleto o corrupto."
      );
  }
}

function validatePdfInput(input: PdfInput): void {
  const result = validatePdfBytes(input.bytes);
  if (!result.ok) {
    pdfError(result.reason);
  }
}

async function assertFolderExists(
  repository: LibraryRepository,
  folderId: string
): Promise<void> {
  const folder = await repository.getFolder(folderId);
  if (!folder) {
    throw new LibraryError(
      "FOLDER_NOT_FOUND",
      "La carpeta seleccionada ya no existe."
    );
  }
}

async function safeRemove(store: FileStore, path: string): Promise<boolean> {
  try {
    await store.remove(path);
    return true;
  } catch (error) {
    console.error(
      "[biblioteca] No se pudo limpiar un objeto de Storage:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

export async function createFolder(
  repository: LibraryRepository,
  rawName: string,
  idFactory: () => string = () => crypto.randomUUID()
): Promise<FolderRecord> {
  const name = validateFolderName(rawName);
  const normalizedName = normalizeFolderName(name);

  const existing = await repository.findFolderByNormalizedName(normalizedName);
  if (existing) {
    throw new LibraryError(
      "FOLDER_EXISTS",
      "Ya existe una carpeta con ese nombre."
    );
  }

  return repository.insertFolder({
    id: idFactory(),
    name,
    normalizedName,
  });
}

export async function renameFolder(
  repository: LibraryRepository,
  rawId: string,
  rawName: string
): Promise<FolderRecord> {
  const id = validateFolderId(rawId);
  const name = validateFolderName(rawName);
  const normalizedName = normalizeFolderName(name);

  const folder = await repository.getFolder(id);
  if (!folder) {
    throw new LibraryError("FOLDER_NOT_FOUND", "La carpeta ya no existe.");
  }

  const existing = await repository.findFolderByNormalizedName(normalizedName);
  if (existing && existing.id !== id) {
    throw new LibraryError(
      "FOLDER_EXISTS",
      "Ya existe otra carpeta con ese nombre."
    );
  }

  return repository.updateFolder(id, name, normalizedName);
}

export async function deleteFolder(
  repository: LibraryRepository,
  rawId: string,
  moveScores: boolean
): Promise<number> {
  const id = validateFolderId(rawId);

  const folder = await repository.getFolder(id);
  if (!folder) {
    throw new LibraryError("FOLDER_NOT_FOUND", "La carpeta ya no existe.");
  }

  const count = await repository.countScoresInFolder(id);
  if (count > 0 && !moveScores) {
    throw new LibraryError(
      "FOLDER_NOT_EMPTY",
      `La carpeta contiene ${count} partitura${count === 1 ? "" : "s"}. Elige moverlas a «Sin carpeta» para eliminarla.`
    );
  }

  await repository.deleteFolderAndUncategorize(id, moveScores);
  return count;
}

export async function createScore(
  repository: LibraryRepository,
  store: FileStore,
  input: {
    title: string;
    folderId: string | null;
    pdf: PdfInput;
  },
  idFactory: () => string = () => crypto.randomUUID()
): Promise<ScoreRecord> {
  const title = validateScoreTitle(input.title);
  const folderId = input.folderId ? validateFolderId(input.folderId) : null;
  if (folderId) {
    await assertFolderExists(repository, folderId);
  }

  validatePdfInput(input.pdf);

  const id = idFactory();
  const storagePath = buildScoreStoragePath(id);
  const sha256Hash = await computeSha256Hex(input.pdf.bytes);

  const record: ScoreRecord = {
    id,
    title,
    originalFilename: sanitizeOriginalFilename(input.pdf.originalFilename),
    folderId,
    storagePath,
    sizeBytes: input.pdf.bytes.byteLength,
    sha256Hash,
  };

  await store.upload(storagePath, input.pdf.bytes, "application/pdf");

  try {
    await repository.insertScore(record);
  } catch (error) {
    await safeRemove(store, storagePath);
    throw error instanceof LibraryError
      ? error
      : new LibraryError(
          "DB_FAILED",
          "No pudimos registrar la partitura. Inténtalo de nuevo."
        );
  }

  return record;
}

export async function updateScoreMetadata(
  repository: LibraryRepository,
  rawId: string,
  input: { title: string; folderId: string | null }
): Promise<ScoreRecord> {
  const id = validateScoreId(rawId);
  const title = validateScoreTitle(input.title);
  const folderId = input.folderId ? validateFolderId(input.folderId) : null;

  const score = await repository.getScore(id);
  if (!score) {
    throw new LibraryError("SCORE_NOT_FOUND", "La partitura ya no existe.");
  }
  if (folderId) {
    await assertFolderExists(repository, folderId);
  }

  return repository.updateScore(id, { title, folderId });
}

export async function replaceScorePdf(
  repository: LibraryRepository,
  store: FileStore,
  rawId: string,
  pdf: PdfInput,
  objectIdFactory: () => string = () => crypto.randomUUID()
): Promise<OperationResult> {
  const id = validateScoreId(rawId);
  const score = await repository.getScore(id);
  if (!score) {
    throw new LibraryError("SCORE_NOT_FOUND", "La partitura ya no existe.");
  }

  validatePdfInput(pdf);

  const newPath = buildScoreStoragePath(id, objectIdFactory());
  const sha256Hash = await computeSha256Hex(pdf.bytes);
  const originalFilename = sanitizeOriginalFilename(pdf.originalFilename);

  await store.upload(newPath, pdf.bytes, "application/pdf");

  let updated: ScoreRecord;
  try {
    updated = await repository.updateScore(id, {
      storagePath: newPath,
      originalFilename,
      sizeBytes: pdf.bytes.byteLength,
      sha256Hash,
    });
  } catch (error) {
    await safeRemove(store, newPath);
    throw error instanceof LibraryError
      ? error
      : new LibraryError(
          "DB_FAILED",
          "No pudimos registrar el reemplazo. Inténtalo de nuevo."
        );
  }

  if (updated.id !== id || updated.storagePath !== newPath) {
    await safeRemove(store, newPath);
    throw new LibraryError(
      "INCONSISTENT_RECORD",
      "El registro no quedó asociado al archivo nuevo. No se eliminó el PDF anterior."
    );
  }

  if (score.storagePath !== newPath) {
    const removed = await safeRemove(store, score.storagePath);
    if (!removed) {
      return {
        score: updated,
        warning:
          "El PDF nuevo quedó activo, pero no pudimos borrar el archivo anterior de Storage.",
      };
    }
  }

  return { score: updated };
}

export async function deleteScore(
  repository: LibraryRepository,
  store: FileStore,
  rawId: string
): Promise<OperationResult> {
  const id = validateScoreId(rawId);
  const score = await repository.getScore(id);
  if (!score) {
    throw new LibraryError("SCORE_NOT_FOUND", "La partitura ya no existe.");
  }

  const deleted = await repository.deleteScore(id);
  if (!deleted) {
    throw new LibraryError("SCORE_NOT_FOUND", "La partitura ya no existe.");
  }

  if (deleted.id !== score.id || deleted.storagePath !== score.storagePath) {
    throw new LibraryError(
      "INCONSISTENT_RECORD",
      "El registro eliminado no coincide con el archivo esperado. No se borró ningún PDF."
    );
  }

  const removed = await safeRemove(store, score.storagePath);
  return {
    score,
    warning: removed
      ? undefined
      : "La partitura se eliminó del catálogo, pero no pudimos borrar su archivo de Storage.",
  };
}
