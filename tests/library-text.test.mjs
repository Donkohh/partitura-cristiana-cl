import test from "node:test";
import assert from "node:assert/strict";
import {
  filterAndSortScores,
  normalizeForSearch,
  sanitizeSearchQuery,
} from "../src/lib/library/text.ts";

test("normaliza mayúsculas, tildes y espacios", () => {
  assert.equal(normalizeForSearch("  Canción   de Cuna "), "cancion de cuna");
});

test("busca sin distinguir tildes ni mayúsculas", () => {
  const scores = [
    { title: "Canción de cuna", originalFilename: "cancion.pdf" },
    { title: "Himno", originalFilename: "himno.pdf" },
  ];

  assert.deepEqual(
    filterAndSortScores(scores, "CANCION").map((score) => score.title),
    ["Canción de cuna"]
  );
});

test("ordena alfabéticamente en español", () => {
  const scores = [
    { title: "Zamba", originalFilename: "z.pdf" },
    { title: "Alabanza", originalFilename: "a.pdf" },
    { title: "Niño", originalFilename: "n.pdf" },
  ];

  assert.deepEqual(
    filterAndSortScores(scores, "").map((score) => score.title),
    ["Alabanza", "Niño", "Zamba"]
  );
});

test("limpia consultas y limita su longitud", () => {
  assert.equal(sanitizeSearchQuery("  himno   <script> "), "himno script");
  assert.equal(sanitizeSearchQuery("a".repeat(300)).length, 120);
  assert.equal(sanitizeSearchQuery(undefined), "");
});
