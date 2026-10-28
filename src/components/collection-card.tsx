import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Collection } from "@/types/music";

interface CollectionCardProps {
  collection: Collection;
  index: number;
  works: number;
  arrangements: number;
}

export function CollectionCard({
  collection,
  index,
  works,
  arrangements,
}: CollectionCardProps) {
  return (
    <Link
      href={`/colecciones/${collection.slug}`}
      className="group grid gap-5 border-t border-border py-8 transition-colors hover:bg-card/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 md:grid-cols-[4.5rem_1fr_auto] md:items-start md:px-4"
    >
      <span className="font-serif text-4xl leading-none text-gold-500/80 transition-colors group-hover:text-gold-600">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div>
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
          {collection.kicker}
        </p>
        <h3 className="mt-2 font-serif text-2xl tracking-[-0.02em] md:text-3xl">
          {collection.name}
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
          {collection.shortDescription}
        </p>
      </div>

      <div className="flex items-center gap-4 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:pt-1">
        <span>
          {works} {works === 1 ? "obra" : "obras"} · {arrangements}{" "}
          {arrangements === 1 ? "versión" : "versiones"}
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-5 text-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}
