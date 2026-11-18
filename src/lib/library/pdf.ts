export const MAX_PDF_MB = 10;
export const MAX_PDF_BYTES = MAX_PDF_MB * 1024 * 1024;

export type PdfValidationReason =
  | "vacio"
  | "demasiado-grande"
  | "sin-cabecera-pdf"
  | "sin-cola-eof";

export interface PdfValidationOptions {
  maxBytes?: number;
  tailWindow?: number;
}

export type PdfValidationResult =
  | { ok: true }
  | { ok: false; reason: PdfValidationReason };

const PDF_HEADER = "%PDF-";
const PDF_EOF_MARKER = "%%EOF";

function decodeAscii(bytes: Uint8Array): string {
  let out = "";
  for (const byte of bytes) {
    out += String.fromCharCode(byte);
  }
  return out;
}

export function validatePdfBytes(
  bytes: Uint8Array,
  options: PdfValidationOptions = {}
): PdfValidationResult {
  const maxBytes = options.maxBytes ?? MAX_PDF_BYTES;
  const tailWindow = options.tailWindow ?? 1024;

  if (bytes.byteLength === 0) {
    return { ok: false, reason: "vacio" };
  }
  if (bytes.byteLength > maxBytes) {
    return { ok: false, reason: "demasiado-grande" };
  }
  if (decodeAscii(bytes.subarray(0, PDF_HEADER.length)) !== PDF_HEADER) {
    return { ok: false, reason: "sin-cabecera-pdf" };
  }

  const tail = decodeAscii(
    bytes.subarray(Math.max(0, bytes.byteLength - tailWindow))
  );
  if (!tail.includes(PDF_EOF_MARKER)) {
    return { ok: false, reason: "sin-cola-eof" };
  }

  return { ok: true };
}

function digestToHex(digest: ArrayBuffer): string {
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function computeSha256Hex(bytes: Uint8Array): Promise<string> {
  const source =
    bytes.buffer instanceof ArrayBuffer
      ? new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength)
      : new Uint8Array(bytes);
  return digestToHex(await crypto.subtle.digest("SHA-256", source));
}

export function formatBytes(bytes: number): string {
  const kb = 1024;
  const mb = 1024 * kb;

  if (bytes < kb) return `${bytes} B`;
  if (bytes < mb) return `${Math.round(bytes / kb)} KB`;
  return `${(bytes / mb).toFixed(1).replace(".", ",")} MB`;
}
