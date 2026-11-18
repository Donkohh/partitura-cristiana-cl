import test from "node:test";
import assert from "node:assert/strict";
import { LibraryError } from "../src/lib/library/errors.ts";
import {
  buildScoreStoragePath,
  isScoreStoragePath,
  SCORE_BUCKET,
} from "../src/lib/library/storage-paths.ts";

const SCORE_ID = "3f1c8d4e-2b7a-4f0e-9a1d-6c5b4a3f2e1d";
const OBJECT_ID = "0a9b8c7d-6e5f-4a3b-2c1d-0e9f8a7b6c5d";

test("construye rutas opacas y verificables", () => {
  const path = buildScoreStoragePath(SCORE_ID, OBJECT_ID);
  assert.equal(path, `scores/${SCORE_ID}/${OBJECT_ID}.pdf`);
  assert.equal(isScoreStoragePath(path), true);
  assert.equal(SCORE_BUCKET, "score-files");
});

test("rechaza identificadores que no son UUID", () => {
  assert.throws(
    () => buildScoreStoragePath("partitura.pdf"),
    (error) =>
      error instanceof LibraryError && error.code === "INCONSISTENT_RECORD"
  );
});
