import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CatalogEntry } from "@/data/demo-catalog";
import { Badge } from "@/components/ui/badge";

interface WorkCardProps {
  entry: CatalogEntry;
  index: number;
}

export function WorkCard({ entry, index }: WorkCardProps) {
  const { work, arrangements } = entry;
  const voicings = Array.from(
    new Set(arrangements.map((arrangement) => arrangement.voicing))
  );

  return (
    <article className="group relative flex h-full flex-col border border-border bg-card p-6 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-editorial has-[a:focus-visible]:border-ring has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/25">
      <div className="flex items-start justify-between gap-4">
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-gold-600">
          Obra {String(index + 1).padStart(2, "0")}
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-5 text-muted-foreground transition-colors group-hover:text-foreground"
        />
      </div>

      <h3 className="mt-8 max-w-[18ch] font-serif text-[1.7rem] leading-[1.08] tracking-[-0.02em]">
        <Link
          href={`/obras/${work.id}`}
          className="after:absolute after:inset-0 focus-visible:outline-none after:content-['']"
        >
          {work.title}
        </Link>
      </h3>

      {work.subtitle ? (
        <p className="mt-2 font-serif text-sm italic text-muted-foreground">
          {work.subtitle}
        </p>
      ) : null}

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {work.originalComposer ?? "Autoría tradicional"}
      </p>

      <div className="mt-auto pt-8">
        <div className="flex flex-wrap gap-1.5">
          {voicings.slice(0, 4).map((voicing) => (
            <Badge
              key={voicing}
              variant="outline"
              className="rounded-none border-border/90 bg-transparent px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
            >
              {voicing}
            </Badge>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border/80 pt-4 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <span>
            {arrangements.length}{" "}
            {arrangements.length === 1 ? "versión" : "versiones"}
          </span>
          <span className="text-gold-600">Ver ficha</span>
        </div>
      </div>
    </article>
  );
}
