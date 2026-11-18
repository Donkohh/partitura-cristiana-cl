import test from "node:test";
import assert from "node:assert/strict";
import { LibraryError } from "../src/lib/library/errors.ts";
import {
  createFolder,
  createScore,
  deleteFolder,
  deleteScore,
  renameFolder,
  replaceScorePdf,
  updateScoreMetadata,
} from "../src/lib/library/operations.ts";
import { buildScoreStoragePath } from "../src/lib/library/storage-paths.ts";

const FOLDER_ID = "3f1c8d4e-2b7a-4f0e-9a1d-6c5b4a3f2e1d";
const OTHER_FOLDER_ID = "0a9b8c7d-6e5f-4a3b-2c1d-0e9f8a7b6c5d";
const SCORE_ID = "9c8b7a6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d";
const OBJECT_ID = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";

function pdfBytes(text = "uno") {
  return new TextEncoder().encode(`%PDF-1.7\n${text}\n%%EOF`);
}

class MemoryRepository {
  constructor() {
    this.folders = new Map();
    this.scores = new Map();
  }

  async getFolder(id) {
    return this.folders.get(id) ?? null;
  }

  async findFolderByNormalizedName(normalizedName) {
    return (
      [...this.folders.values()].find(
        (folder) => folder.normalizedName === normalizedName
      ) ?? null
    );
  }

  async insertFolder(folder) {
    if (await this.findFolderByNormalizedName(folder.normalizedName)) {
      throw new LibraryError("FOLDER_EXISTS", "Carpeta duplicada.");
    }
    this.folders.set(folder.id, folder);
    return folder;
  }

  async updateFolder(id, name, normalizedName) {
    const current = this.folders.get(id);
    if (!current) throw new LibraryError("FOLDER_NOT_FOUND", "No existe.");
    const folder = { ...current, name, normalizedName };
    this.folders.set(id, folder);
    return folder;
  }

  async countScoresInFolder(folderId) {
    return [...this.scores.values()].filter(
      (score) => score.folderId === folderId
    ).length;
  }

  async deleteFolderAndUncategorize(folderId, moveScores) {
    if (!this.folders.has(folderId)) {
      throw new LibraryError("FOLDER_NOT_FOUND", "No existe.");
    }
    for (const [id, score] of this.scores) {
      if (score.folderId === folderId && moveScores) {
        this.scores.set(id, { ...score, folderId: null });
      }
    }
    this.folders.delete(folderId);
  }

  async getScore(id) {
    return this.scores.get(id) ?? null;
  }

  async insertScore(score) {
    this.scores.set(score.id, score);
  }

  async updateScore(id, patch) {
    const current = this.scores.get(id);
    if (!current) throw new LibraryError("SCORE_NOT_FOUND", "No existe.");
    const updated = { ...current, ...patch };
    this.scores.set(id, updated);
    return updated;
  }

  async deleteScore(id) {
    const current = this.scores.get(id) ?? null;
    this.scores.delete(id);
    return current;
  }
}

class MemoryStore {
  constructor() {
    this.objects = new Map();
    this.removals = [];
  }

  async upload(path, bytes) {
    this.objects.set(path, bytes);
  }

  async remove(path) {
    this.removals.push(path);
    this.objects.delete(path);
  }
}

async function seedScore(repository, store, folderId = null) {
  return createScore(
    repository,
    store,
    {
      title: "Himno 42",
      folderId,
      pdf: { bytes: pdfBytes(), originalFilename: "C:\\temp\\Himno 42.pdf" },
    },
    () => SCORE_ID
  );
}

test("crea, renombra y evita carpetas duplicadas", async () => {
  const repository = new MemoryRepository();
  const folder = await createFolder(repository, "  Coro  ", () => FOLDER_ID);

  assert.equal(folder.name, "Coro");
  assert.equal(folder.normalizedName, "coro");

  await assert.rejects(
    createFolder(repository, "coro", () => OTHER_FOLDER_ID),
    (error) => error instanceof LibraryError && error.code === "FOLDER_EXISTS"
  );

  const renamed = await renameFolder(repository, FOLDER_ID, "Coro domingo");
  assert.equal(renamed.name, "Coro domingo");
});

test("elimina una carpeta solo si se mueven sus partituras", async () => {
  const repository = new MemoryRepository();
  const store = new MemoryStore();
  await createFolder(repository, "Coro", () => FOLDER_ID);
  await seedScore(repository, store, FOLDER_ID);

  await assert.rejects(
    deleteFolder(repository, FOLDER_ID, false),
    (error) => error instanceof LibraryError && error.code === "FOLDER_NOT_EMPTY"
  );

  const moved = await deleteFolder(repository, FOLDER_ID, true);
  assert.equal(moved, 1);
  assert.equal(repository.folders.size, 0);
  assert.equal(repository.scores.get(SCORE_ID).folderId, null);
});

test("sube un PDF con ruta opaca y registra el metadato", async () => {
  const repository = new MemoryRepository();
  const store = new MemoryStore();
  const score = await seedScore(repository, store);

  assert.equal(score.originalFilename, "Himno 42.pdf");
  assert.equal(score.storagePath, buildScoreStoragePath(SCORE_ID));
  assert.equal(store.objects.has(score.storagePath), true);
  assert.equal(score.sizeBytes, pdfBytes().byteLength);
});

test("rechaza PDF inválidos antes de subir", async () => {
  const repository = new MemoryRepository();
  const store = new MemoryStore();

  await assert.rejects(
    createScore(
      repository,
      store,
      {
        title: "Malo",
        folderId: null,
        pdf: {
          bytes: new TextEncoder().encode("no es un pdf"),
          originalFilename: "malo.pdf",
        },
      },
      () => SCORE_ID
    ),
    (error) => error instanceof LibraryError && error.code === "PDF_INVALID_HEADER"
  );

  assert.equal(store.objects.size, 0);
});

test("compensa Storage si falla el registro en la base", async () => {
  const repository = new MemoryRepository();
  const store = new MemoryStore();
  repository.insertScore = async () => {
    throw new Error("db caída");
  };

  await assert.rejects(
    seedScore(repository, store),
    (error) => error instanceof LibraryError && error.code === "DB_FAILED"
  );

  assert.equal(store.objects.size, 0);
  assert.deepEqual(store.removals, [buildScoreStoragePath(SCORE_ID)]);
});

test("actualiza metadatos y valida la carpeta", async () => {
  const repository = new MemoryRepository();
  const store = new MemoryStore();
  await createFolder(repository, "Coro", () => FOLDER_ID);
  await seedScore(repository, store);

  const updated = await updateScoreMetadata(repository, SCORE_ID, {
    title: "  Himno 43 ",
    folderId: FOLDER_ID,
  });
  assert.equal(updated.title, "Himno 43");
  assert.equal(updated.folderId, FOLDER_ID);

  await assert.rejects(
    updateScoreMetadata(repository, SCORE_ID, {
      title: "Himno",
      folderId: OTHER_FOLDER_ID,
    }),
    (error) => error instanceof LibraryError && error.code === "FOLDER_NOT_FOUND"
  );
});

test("reemplaza el PDF y elimina el objeto anterior", async () => {
  const repository = new MemoryRepository();
  const store = new MemoryStore();
  const original = await seedScore(repository, store);
  const oldPath = original.storagePath;

  const result = await replaceScorePdf(
    repository,
    store,
    SCORE_ID,
    { bytes: pdfBytes("nuevo"), originalFilename: "nuevo.pdf" },
    () => OBJECT_ID
  );

  const newPath = buildScoreStoragePath(SCORE_ID, OBJECT_ID);
  assert.equal(result.score.storagePath, newPath);
  assert.equal(store.objects.has(newPath), true);
  assert.equal(store.objects.has(oldPath), false);
});

test("si falla el reemplazo, conserva el archivo anterior", async () => {
  const repository = new MemoryRepository();
  const store = new MemoryStore();
  const original = await seedScore(repository, store);
  repository.updateScore = async () => {
    throw new Error("db caída");
  };

  await assert.rejects(
    replaceScorePdf(
      repository,
      store,
      SCORE_ID,
      { bytes: pdfBytes("nuevo"), originalFilename: "nuevo.pdf" },
      () => OBJECT_ID
    ),
    (error) => error instanceof LibraryError && error.code === "DB_FAILED"
  );

  assert.equal(store.objects.has(original.storagePath), true);
  assert.equal(store.objects.has(buildScoreStoragePath(SCORE_ID, OBJECT_ID)), false);
});

test("elimina registro y archivo, sin borrar si el registro no coincide", async () => {
  const repository = new MemoryRepository();
  const store = new MemoryStore();
  const score = await seedScore(repository, store);

  const result = await deleteScore(repository, store, SCORE_ID);
  assert.equal(result.score.id, SCORE_ID);
  assert.equal(repository.scores.size, 0);
  assert.equal(store.objects.has(score.storagePath), false);

  const repository2 = new MemoryRepository();
  const store2 = new MemoryStore();
  const score2 = await seedScore(repository2, store2);
  repository2.deleteScore = async () => ({
    ...score2,
    storagePath: buildScoreStoragePath(SCORE_ID, OBJECT_ID),
  });

  await assert.rejects(
    deleteScore(repository2, store2, SCORE_ID),
    (error) =>
      error instanceof LibraryError && error.code === "INCONSISTENT_RECORD"
  );
  assert.equal(store2.objects.has(score2.storagePath), true);
});
