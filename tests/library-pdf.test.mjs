import test from "node:test";
import assert from "node:assert/strict";
import {
  computeSha256Hex,
  formatBytes,
  MAX_PDF_BYTES,
  MAX_PDF_MB,
  validatePdfBytes,
} from "../src/lib/library/pdf.ts";

function pdfBytes(body = "contenido") {
  return new TextEncoder().encode(`%PDF-1.7\n${body}\n%%EOF`);
}

test("acepta un PDF con cabecera y cola", () => {
  assert.deepEqual(validatePdfBytes(pdfBytes()), { ok: true });
});

test("rechaza archivos vacíos, sin cabecera o sin cola", () => {
  assert.deepEqual(validatePdfBytes(new Uint8Array()), {
    ok: false,
    reason: "vacio",
  });
  assert.deepEqual(validatePdfBytes(new TextEncoder().encode("hola")), {
    ok: false,
    reason: "sin-cabecera-pdf",
  });
  assert.deepEqual(validatePdfBytes(new TextEncoder().encode("%PDF-1.7 x")), {
    ok: false,
    reason: "sin-cola-eof",
  });
});

test("el límite público es de 10 MB", () => {
  assert.equal(MAX_PDF_MB, 10);
  assert.equal(MAX_PDF_BYTES, 10 * 1024 * 1024);
});

test("respeta el límite configurado", () => {
  const bytes = pdfBytes("1234567890");
  assert.equal(validatePdfBytes(bytes, { maxBytes: bytes.byteLength }).ok, true);
  assert.deepEqual(
    validatePdfBytes(bytes, { maxBytes: bytes.byteLength - 1 }),
    { ok: false, reason: "demasiado-grande" }
  );
});

test("calcula SHA-256 estable", async () => {
  const hash = await computeSha256Hex(new TextEncoder().encode("abc"));
  assert.equal(
    hash,
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
  );
});

test("formatea tamaños", () => {
  assert.equal(formatBytes(512), "512 B");
  assert.equal(formatBytes(2048), "2 KB");
  assert.equal(formatBytes(2.5 * 1024 * 1024), "2,5 MB");
});
