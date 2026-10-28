import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Partituras Cristianas Chile · Archivo coral",
    template: "%s · Partituras Cristianas Chile",
  },
  description:
    "Partituras Cristianas Chile: un archivo vivo de partituras corales chilenas. Explora obras, colecciones y versiones para distintos tipos de coro.",
  applicationName: "Partituras Cristianas Chile",
  keywords: [
    "partituras cristianas Chile",
    "partituras corales",
    "música coral chilena",
    "himnos",
    "arreglos corales",
    "archivo musical",
  ],
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: "Partituras Cristianas Chile",
    title: "Partituras Cristianas Chile · Archivo coral",
    description:
      "Un archivo vivo de partituras corales chilenas. Explora obras, colecciones y versiones para distintos tipos de coro.",
  },
};

export const viewport: Viewport = {
  themeColor: "#10283f",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-CL"
      className={`${jakarta.variable} ${sourceSerif.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <a
          href="#contenido"
          className="sr-only z-[100] bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Saltar al contenido
        </a>
        <SiteHeader />
        <main id="contenido" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
