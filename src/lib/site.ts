export const SITE_NAME = "Donko Partituras";
export const SITE_DESCRIPTION =
  "Aquí subo las partituras que tengo y a veces uso. Una biblioteca personal de PDFs para consultar y descargar.";

function withProtocol(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  try {
    return new URL(withProtocol(configured || "http://localhost:3000"));
  } catch {
    return new URL("http://localhost:3000");
  }
}
