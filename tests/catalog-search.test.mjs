import assert from "node:assert/strict";
import { test } from "node:test";
import {
  arrangementMatchesFilters,
  normalizeSearchText,
  sanitizeSearchQuery,
  scoreWorkMatch,
  searchCatalog,
  workMatchesQuery,
} from "../src/lib/catalog-search.ts";

const work = {
  id: "w1",
  title: "Canción del Señor",
  subtitle: "Himno de Adviento",
  originalComposer: "Juan Pérez",
  lyricist: "Ana Núñez",
  historicalNotes: "Obra tradicional chilena",
};

const otherWork = {
  id: "w2",
  title: "Otra obra",
  originalComposer: "Otro autor",
  historicalNotes: "Texto general",
};

const satb = {
  id: "a1",
  workId: "w1",
  title: "Versión coral",
  arranger: "Equipo editorial",
  voicing: "SATB",
  accompaniment: "A cappella",
  collectionIds: ["c1"],
  tonality: "Do mayor",
  meter: "4/4",
  tempo: "Andante",
  difficulty: "Intermedia",
  duration: "3:00",
};

const sab = {
  ...satb,
  id: "a2",
  title: "Versión para tres voces",
  voicing: "SAB",
  accompaniment: "Piano",
  collectionIds: ["c2"],
};

const entries = [
  { work: otherWork, arrangements: [] },
  { work, arrangements: [satb, sab] },
];

test("normaliza mayúsculas, tildes y espacios", () => {
  assert.equal(
    normalizeSearchText("  Canción   del   Señor "),
    "cancion del senor"
  );
});

test("sanea caracteres que alteran filtros y limita la consulta", () => {
  assert.equal(sanitizeSearchQuery("  canción, (señor)%  "), "canción señor");
  assert.equal(sanitizeSearchQuery("   "), "");
  assert.equal(sanitizeSearchQuery(null), "");
  assert.equal(sanitizeSearchQuery("a".repeat(200)).length, 120);
});

test("encuentra coincidencias parciales sin tildes", () => {
  assert.equal(workMatchesQuery(work, "cancion"), true);
  assert.equal(workMatchesQuery(work, "Perez"), true);
  assert.equal(workMatchesQuery(work, "adviento"), true);
  assert.equal(workMatchesQuery(work, "tradicional"), true);
  assert.equal(workMatchesQuery(work, "inexistente"), false);
});

test("prioriza coincidencias en el título", () => {
  assert.ok(
    scoreWorkMatch(work, "cancion") > scoreWorkMatch(work, "tradicional")
  );
});

test("ordena por relevancia y luego por título", () => {
  const results = searchCatalog(entries, { query: "cancion" });

  assert.deepEqual(
    results.map((entry) => entry.work.id),
    ["w1"]
  );
});

test("filtra arreglos por formación y colección", () => {
  assert.equal(arrangementMatchesFilters(satb, {}), true);
  assert.equal(arrangementMatchesFilters(satb, { voicing: "SATB" }), true);
  assert.equal(arrangementMatchesFilters(satb, { voicing: "TTBB" }), false);
  assert.equal(
    arrangementMatchesFilters(satb, { collectionId: "c1" }),
    true
  );
  assert.equal(
    arrangementMatchesFilters(satb, { collectionId: "c2" }),
    false
  );
});

test("aplica filtros a los arreglos devueltos y descarta obras sin versiones", () => {
  const byVoicing = searchCatalog(entries, { voicing: "SAB" });

  assert.equal(byVoicing.length, 1);
  assert.deepEqual(
    byVoicing[0].arrangements.map((arrangement) => arrangement.id),
    ["a2"]
  );

  const byCollection = searchCatalog(entries, { collectionId: "c2" });

  assert.equal(byCollection.length, 1);
  assert.equal(byCollection[0].work.id, "w1");
  assert.equal(byCollection[0].arrangements.length, 1);
});

test("busca también en los metadatos de los arreglos", () => {
  const byArranger = searchCatalog(entries, { query: "equipo" });
  const byVoicing = searchCatalog(entries, { query: "satb" });

  assert.equal(byArranger.length, 1);
  assert.equal(byVoicing.length, 1);
  assert.equal(byVoicing[0].work.id, "w1");
});

test("devuelve todo el catálogo ordenado cuando no hay consulta ni filtros", () => {
  const results = searchCatalog(entries);

  assert.equal(results.length, 2);
  assert.equal(results[0].work.id, "w1");
  assert.equal(results[1].work.id, "w2");
});
