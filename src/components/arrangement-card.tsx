import Link from "next/link";
import { Clock3, Music2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCollectionsForArrangement } from "@/data/demo-catalog";
import type { Arrangement } from "@/types/music";

interface ArrangementCardProps {
  arrangement: Arrangement;
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm text-foreground">{value}</dd>
    </div>
  );
}

export function ArrangementCard({ arrangement }: ArrangementCardProps) {
  const collections = getCollectionsForArrangement(arrangement);

  return (
    <article className="border border-border bg-card p-6 transition-colors hover:border-primary/20 md:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-none bg-primary px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-primary-foreground">
              {arrangement.voicing}
            </Badge>
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {arrangement.accompaniment}
            </span>
          </div>
          <h3 className="mt-4 font-serif text-2xl leading-tight tracking-[-0.02em]">
            {arrangement.title}
          </h3>
          <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
            <Music2 aria-hidden="true" className="size-3.5" />
            {arrangement.arranger}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-gold-600">
          <Clock3 aria-hidden="true" className="size-3.5" />
          {arrangement.duration}
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-border/80 pt-5 sm:grid-cols-4">
        <MetaItem label="Tonalidad" value={arrangement.tonality} />
        <MetaItem label="Compás" value={arrangement.meter} />
        <MetaItem label="Carácter" value={arrangement.tempo} />
        <MetaItem label="Dificultad" value={arrangement.difficulty} />
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/80 pt-4">
        <span className="mr-1 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Colecciones
        </span>
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/colecciones/${collection.slug}`}
            className="border border-border px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            {collection.name}
          </Link>
        ))}
      </div>
    </article>
  );
}
