import { LibraryBrowser } from "@/components/library/library-browser";
import { loadPublicLibrary } from "@/lib/library/queries";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let snapshot;
  try {
    snapshot = await loadPublicLibrary();
  } catch {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <h1 className="font-serif text-3xl tracking-tight">{SITE_NAME}</h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-ink-soft">
          La biblioteca no está disponible en este momento. Inténtalo de nuevo
          en unos minutos.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
      <header className="border-b border-line pb-8">
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
          {SITE_NAME}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-ink-soft">
          Aquí subo las partituras que tengo y a veces uso.
        </p>
      </header>

      <LibraryBrowser folders={snapshot.folders} scores={snapshot.scores} />
    </div>
  );
}
