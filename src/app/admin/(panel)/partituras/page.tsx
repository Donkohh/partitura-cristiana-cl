import type { Metadata } from "next";
import { ScoreManageRow } from "@/components/admin/score-manage-row";
import { ScoreUploadForm } from "@/components/admin/score-upload-form";
import { requireAdmin } from "@/lib/auth/admin";
import { loadAdminLibrary } from "@/lib/library/admin-queries";

export const metadata: Metadata = {
  title: "Partituras",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminScoresPage() {
  await requireAdmin("/admin/partituras");

  let snapshot;
  try {
    snapshot = await loadAdminLibrary();
  } catch {
    return (
      <p className="border border-clay/30 bg-clay-soft px-4 py-3 text-sm text-clay">
        No pudimos cargar la biblioteca. Revisa la configuración de Supabase e
        inténtalo de nuevo.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-serif text-2xl tracking-tight">Partituras</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Sube un PDF y define cómo se verá en la biblioteca.
        </p>

        <div className="mt-5 border border-line bg-paper p-5">
          <ScoreUploadForm folders={snapshot.folders} />
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-xl tracking-tight">Biblioteca</h2>
          <p className="text-xs text-ink-soft">
            {snapshot.scores.length} partitura
            {snapshot.scores.length === 1 ? "" : "s"}
          </p>
        </div>

        {snapshot.scores.length === 0 ? (
          <p className="mt-4 border border-dashed border-line bg-paper px-5 py-10 text-center text-sm text-ink-soft">
            Todavía no hay partituras. Usa el formulario de arriba para subir la
            primera.
          </p>
        ) : (
          <ol className="mt-3 divide-y divide-line border-y border-line bg-paper px-5">
            {snapshot.scores.map((score) => (
              <ScoreManageRow
                key={score.id}
                score={score}
                folders={snapshot.folders}
              />
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
