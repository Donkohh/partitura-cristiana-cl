import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#faf8f3",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CL">
      <body className="flex min-h-screen flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-moss focus:px-4 focus:py-2 focus:text-paper"
        >
          Saltar al contenido
        </a>
        <main id="contenido" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <footer className="border-t border-line/80">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-xs text-ink-soft sm:px-8">
            <p>{SITE_NAME}</p>
            <Link
              href="/admin"
              className="underline decoration-line underline-offset-4 transition-colors hover:text-ink"
            >
              Panel
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
