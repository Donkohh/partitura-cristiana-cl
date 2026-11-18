export type LibraryErrorCode =
  | "FOLDER_EMPTY"
  | "FOLDER_TOO_LONG"
  | "FOLDER_NOT_FOUND"
  | "FOLDER_EXISTS"
  | "FOLDER_NOT_EMPTY"
  | "TITLE_EMPTY"
  | "TITLE_TOO_LONG"
  | "SCORE_NOT_FOUND"
  | "INVALID_FOLDER"
  | "PDF_EMPTY"
  | "PDF_TOO_LARGE"
  | "PDF_INVALID_HEADER"
  | "PDF_INVALID_EOF"
  | "STORAGE_UPLOAD_FAILED"
  | "STORAGE_DELETE_FAILED"
  | "DB_FAILED"
  | "INCONSISTENT_RECORD";

export class LibraryError extends Error {
  readonly code: LibraryErrorCode;

  constructor(code: LibraryErrorCode, message: string) {
    super(message);
    this.name = "LibraryError";
    this.code = code;
  }
}
