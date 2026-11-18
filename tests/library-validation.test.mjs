import test from "node:test";
import assert from "node:assert/strict";
import { LibraryError } from "../src/lib/library/errors.ts";
import {
  isUuid,
  normalizeFolderName,
  parseFolderId,
  sanitizeDownloadFilename,
  sanitizeOriginalFilename,
  validateFolderName,
  validateScoreTitle,
} from "../src/lib/library/validation.ts";

test("reconoce UUIDs válidos", () => {
  assert.equal(isUuid("3f1c8d4e-2b7a-4f0e-9a1d-6c5b4a3f2e1d"), true);
  assert.equal(isUuid("no-es-uuid"), false);
});

test("normaliza nombres de carpeta", () => {
  assert.equal(normalizeFolderName("  Coro   Domingo "), "coro domingo");
  assert.equal(normalizeFolderName("Canción"), "cancion");
});

test("valida nombres de carpeta y títulos", () => {
  assert.equal(validateFolderName("  Coro  "), "Coro");
  assert.equal(validateScoreTitle("  Himno   42 "), "Himno 42");

  assert.throws(
    () => validateFolderName("   "),
    (error) => error instanceof LibraryError && error.code === "FOLDER_EMPTY"
  );
  assert.throws(
    () => validateScoreTitle(""),
    (error) => error instanceof LibraryError && error.code === "TITLE_EMPTY"
  );
});

test("interpreta la carpeta de un formulario", () => {
  assert.equal(parseFolderId(""), null);
  assert.equal(parseFolderId(null), null);
  assert.equal(
    parseFolderId("3F1C8D4E-2B7A-4F0E-9A1D-6C5B4A3F2E1D"),
    "3f1c8d4e-2b7a-4f0e-9a1d-6c5b4a3f2e1d"
  );
  assert.throws(
    () => parseFolderId("otra"),
    (error) => error instanceof LibraryError && error.code === "INVALID_FOLDER"
  );
});

test("sanea nombres de archivo", () => {
  assert.equal(sanitizeOriginalFilename("C:\\ruta\\Partitura.pdf"), "Partitura.pdf");
  assert.equal(sanitizeOriginalFilename("   "), "partitura.pdf");
  assert.equal(sanitizeDownloadFilename("Himno 42"), "Himno 42.pdf");
  assert.equal(sanitizeDownloadFilename("Himno.pdf"), "Himno.pdf");
  assert.equal(sanitizeDownloadFilename("a/b:c*"), "abc.pdf");
});
