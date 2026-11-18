import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">404</p>
      <h1 className="mt-3 font-serif text-3xl tracking-tight">
        Esta página no existe.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-ink-soft">
        Puede que el enlace haya cambiado. Vuelve a la biblioteca para seguir
        buscando.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center border border-line px-4 text-sm font-medium transition-colors hover:border-moss hover:text-moss"
      >
        Volver a la biblioteca
      </Link>
    </div>
  );
}
