"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] Error global:", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="es-CL">
      <body
        style={{
          margin: 0,
          fontFamily:
            "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
          background: "#faf8f3",
          color: "#1f2a24",
        }}
      >
        <main style={{ maxWidth: 640, margin: "0 auto", padding: "80px 20px" }}>
          <h1 style={{ fontSize: 28, margin: 0, lineHeight: 1.2 }}>
            Algo no salió como esperábamos.
          </h1>
          <p
            style={{
              marginTop: 16,
              lineHeight: 1.7,
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            La aplicación tuvo un problema inesperado. Inténtalo de nuevo.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "10px 16px",
              border: "1px solid #b9b1a2",
              background: "#ffffff",
              color: "#1f2a24",
              cursor: "pointer",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
