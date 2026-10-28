import assert from "node:assert/strict";
import { test } from "node:test";
import {
  catalogStats,
  demoArrangements,
  demoCatalogEntries,
  demoCollections,
  demoWorks,
  getCollectionStats,
} from "../src/data/demo-catalog.ts";

test("los identificadores de obras, arreglos y colecciones son únicos", () => {
  assert.equal(new Set(demoWorks.map((work) => work.id)).size, demoWorks.length);
  assert.equal(
    new Set(demoArrangements.map((arrangement) => arrangement.id)).size,
    demoArrangements.length
  );
  assert.equal(
    new Set(demoCollections.map((collection) => collection.id)).size,
    demoCollections.length
  );
});

test("cada arreglo referencia una obra y colecciones existentes", () => {
  const workIds = new Set(demoWorks.map((work) => work.id));
  const collectionIds = new Set(
    demoCollections.map((collection) => collection.id)
  );

  for (const arrangement of demoArrangements) {
    assert.equal(workIds.has(arrangement.workId), true);
    assert.ok(arrangement.collectionIds.length > 0);

    for (const collectionId of arrangement.collectionIds) {
      assert.equal(collectionIds.has(collectionId), true);
    }
  }
});

test("todas las obras tienen al menos una versión y aparecen en el catálogo", () => {
  assert.equal(demoCatalogEntries.length, demoWorks.length);

  for (const entry of demoCatalogEntries) {
    assert.ok(entry.arrangements.length > 0);
  }
});

test("las estadísticas generales coinciden con los datos demo", () => {
  assert.equal(catalogStats.works, demoWorks.length);
  assert.equal(catalogStats.arrangements, demoArrangements.length);
  assert.equal(catalogStats.collections, demoCollections.length);

  for (const collection of demoCollections) {
    const stats = getCollectionStats(collection.id);

    assert.ok(stats.works > 0);
    assert.ok(stats.arrangements > 0);
    assert.ok(stats.voicings > 0);
  }
});
