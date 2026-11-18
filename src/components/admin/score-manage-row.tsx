"use client";

import { useActionState } from "react";
import { INITIAL_ACTION_STATE } from "@/lib/admin/action-state";
import {
  actualizarPartitura,
  eliminarPartitura,
  reemplazarPartitura,
} from "@/lib/admin/score-actions";
import { formatBytes } from "@/lib/library/pdf";
import type { LibraryFolder, LibraryScore } from "@/lib/library/types";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

interface ScoreManageRowProps {
  score: LibraryScore;
  folders: LibraryFolder[];
}

export function ScoreManageRow({ score, folders }: ScoreManageRowProps) {
  const [editState, editAction] = useActionState(
    actualizarPartitura,
    INITIAL_ACTION_STATE
  );
  const [replaceState, replaceAction] = useActionState(
    reemplazarPartitura,
    INITIAL_ACTION_STATE
  );
  const [deleteState, deleteAction] = useActionState(
    eliminarPartitura,
    INITIAL_ACTION_STATE
  );

  return (
    <li className="py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-serif text-lg leading-snug">{score.title}</p>
        <p className="text-xs text-ink-soft">
          {score.originalFilename} · {formatBytes(score.sizeBytes)}
        </p>
      </div>
      <p className="mt-1 text-xs text-ink-soft">
        {score.folderName ?? "Sin carpeta"}
      </p>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-xs font-medium text-ink-soft hover:text-ink">
          Editar
        </summary>

        <div className="mt-4 space-y-5 border-l border-line pl-4">
          <form action={editAction} className="space-y-3">
            <input type="hidden" name="scoreId" value={score.id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`titulo-${score.id}`}
                  className="text-xs font-medium"
                >
                  Nombre visible
                </label>
                <input
                  id={`titulo-${score.id}`}
                  name="title"
                  type="text"
                  required
                  maxLength={160}
                  defaultValue={score.title}
                  className="mt-1 h-9 w-full border border-line bg-white px-3 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor={`carpeta-${score.id}`}
                  className="text-xs font-medium"
                >
                  Carpeta
                </label>
                <select
                  id={`carpeta-${score.id}`}
                  name="folderId"
                  defaultValue={score.folderId ?? ""}
                  className="mt-1 h-9 w-full border border-line bg-white px-3 text-sm"
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
            <FormMessage state={editState} />
            <SubmitButton variant="secondary">Guardar datos</SubmitButton>
          </form>

          <form action={replaceAction} className="space-y-3 border-t border-line pt-4">
            <input type="hidden" name="scoreId" value={score.id} />
            <input type="hidden" name="intencion" value="reemplazar" />
            <p className="text-xs text-ink-soft">
              Reemplazar el PDF mantiene el nombre visible y la carpeta.
            </p>
            <input
              name="archivo"
              type="file"
              required
              accept="application/pdf,.pdf"
              className="block w-full cursor-pointer border border-line bg-white px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-paper-deep file:px-2 file:py-1 file:text-xs"
            />
            <FormMessage state={replaceState} />
            <SubmitButton
              variant="secondary"
              pendingLabel="Reemplazando..."
              confirmMessage="¿Reemplazar el PDF actual por el archivo seleccionado?"
            >
              Reemplazar PDF
            </SubmitButton>
          </form>

          <form action={deleteAction} className="space-y-3 border-t border-line pt-4">
            <input type="hidden" name="scoreId" value={score.id} />
            <input type="hidden" name="intencion" value="eliminar" />
            <p className="text-xs text-ink-soft">
              Elimina el registro y su PDF. No se puede deshacer.
            </p>
            <FormMessage state={deleteState} />
            <SubmitButton
              variant="danger"
              pendingLabel="Eliminando..."
              confirmMessage={`¿Eliminar «${score.title}» de la biblioteca?`}
            >
              Eliminar partitura
            </SubmitButton>
          </form>
        </div>
      </details>
    </li>
  );
}
