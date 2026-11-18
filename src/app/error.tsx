"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] Error no controlado:", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Error</p>
      <h1 className="mt-3 font-serif text-3xl tracking-tight">
        Algo no salió como esperábamos.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-ink-soft">
        Inténtalo de nuevo. Si el problema continúa, vuelve más tarde.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center border border-line bg-white px-4 text-sm font-medium transition-colors hover:border-moss hover:text-moss"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="inline-flex h-10 items-center border border-line px-4 text-sm font-medium transition-colors hover:border-moss hover:text-moss"
        >
          Volver a la biblioteca
        </Link>
      </div>
    </div>
  );
}
