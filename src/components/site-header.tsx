import Link from "next/link";
import { SiteNav } from "@/components/site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/92 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="Partituras Cristianas Chile, ir al inicio"
        >
          <span className="relative grid size-10 place-items-center overflow-hidden bg-primary text-primary-foreground">
            <span className="absolute inset-x-0 top-1/2 h-px bg-gold-400/60" />
            <span className="font-serif text-[1.8rem] leading-none">p</span>
          </span>
          <span className="flex flex-col">
            <span className="font-serif text-xl leading-none tracking-tight">
              Partituras
            </span>
            <span className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
              Cristianas Chile
            </span>
          </span>
        </Link>

        <SiteNav />
      </div>
    </header>
  );
}
