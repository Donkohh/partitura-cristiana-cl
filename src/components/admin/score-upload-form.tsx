"use client";

import { useActionState, useEffect, useRef } from "react";
import { INITIAL_ACTION_STATE } from "@/lib/admin/action-state";
import { subirPartitura } from "@/lib/admin/score-actions";
import { MAX_PDF_MB } from "@/lib/library/pdf";
import type { LibraryFolder } from "@/lib/library/types";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export function ScoreUploadForm({ folders }: { folders: LibraryFolder[] }) {
  const [state, formAction] = useActionState(
    subirPartitura,
    INITIAL_ACTION_STATE
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="nuevo-titulo" className="text-sm font-medium">
            Nombre visible
          </label>
          <input
            id="nuevo-titulo"
            name="title"
            type="text"
            required
            maxLength={160}
            placeholder="Ej. Himno 42"
            className="mt-1 h-10 w-full border border-line bg-white px-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="nueva-carpeta" className="text-sm font-medium">
            Carpeta
          </label>
          <select
            id="nueva-carpeta"
            name="folderId"
            defaultValue=""
            className="mt-1 h-10 w-full border border-line bg-white px-3 text-sm"
          >
            <option value="">Sin carpeta</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="nuevo-archivo" className="text-sm font-medium">
          Archivo PDF
        </label>
        <input
          id="nuevo-archivo"
          name="archivo"
          type="file"
          required
          accept="application/pdf,.pdf"
          className="mt-1 block w-full cursor-pointer border border-line bg-white px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-paper-deep file:px-2 file:py-1 file:text-xs"
        />
        <p className="mt-1 text-xs text-ink-soft">
          Solo PDF, hasta {MAX_PDF_MB} MB. Se guarda con un nombre interno opaco.
        </p>
      </div>

      <FormMessage state={state} />

      <SubmitButton pendingLabel="Subiendo...">Agregar partitura</SubmitButton>
    </form>
  );
}
