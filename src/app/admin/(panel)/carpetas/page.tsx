import type { Metadata } from "next";
import { FolderCreateForm } from "@/components/admin/folder-create-form";
import { FolderRow } from "@/components/admin/folder-row";
import { requireAdmin } from "@/lib/auth/admin";
import { loadAdminLibrary } from "@/lib/library/admin-queries";

export const metadata: Metadata = {
  title: "Carpetas",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminFoldersPage() {
  await requireAdmin("/admin/carpetas");

  let snapshot;
  try {
    snapshot = await loadAdminLibrary();
  } catch {
    return (
      <p className="border border-clay/30 bg-clay-soft px-4 py-3 text-sm text-clay">
        No pudimos cargar las carpetas. Revisa la configuración de Supabase e
        inténtalo de nuevo.
      </p>
    );
  }

  const counts = new Map<string, number>();
  let withoutFolder = 0;

  for (const score of snapshot.scores) {
    if (!score.folderId) {
      withoutFolder += 1;
      continue;
    }
    counts.set(score.folderId, (counts.get(score.folderId) ?? 0) + 1);
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-serif text-2xl tracking-tight">Carpetas</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Organiza la biblioteca. Al eliminar una carpeta con partituras, se
          mueven a «Sin carpeta».
        </p>

        <div className="mt-5 border border-line bg-paper p-5">
          <FolderCreateForm />
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-xl tracking-tight">Tus carpetas</h2>
          <p className="text-xs text-ink-soft">
            {snapshot.folders.length} carpeta
            {snapshot.folders.length === 1 ? "" : "s"} · {withoutFolder} sin
            carpeta
          </p>
        </div>

        {snapshot.folders.length === 0 ? (
          <p className="mt-4 border border-dashed border-line bg-paper px-5 py-10 text-center text-sm text-ink-soft">
            Todavía no hay carpetas.
          </p>
        ) : (
          <ol className="mt-3 divide-y divide-line border-y border-line bg-paper px-5">
            {snapshot.folders.map((folder) => (
              <FolderRow
                key={folder.id}
                folder={folder}
                scoreCount={counts.get(folder.id) ?? 0}
              />
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
