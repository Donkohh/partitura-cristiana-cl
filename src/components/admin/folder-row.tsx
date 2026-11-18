"use client";

import { useActionState } from "react";
import { INITIAL_ACTION_STATE } from "@/lib/admin/action-state";
import { eliminarCarpeta, renombrarCarpeta } from "@/lib/admin/folder-actions";
import type { LibraryFolder } from "@/lib/library/types";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

interface FolderRowProps {
  folder: LibraryFolder;
  scoreCount: number;
}

export function FolderRow({ folder, scoreCount }: FolderRowProps) {
  const [renameState, renameAction] = useActionState(
    renombrarCarpeta,
    INITIAL_ACTION_STATE
  );
  const [deleteState, deleteAction] = useActionState(
    eliminarCarpeta,
    INITIAL_ACTION_STATE
  );

  return (
    <li className="py-5">
      <form
        action={renameAction}
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
      >
        <input type="hidden" name="folderId" value={folder.id} />
        <div className="flex-1">
          <label
            htmlFor={`carpeta-nombre-${folder.id}`}
            className="text-xs font-medium text-ink-soft"
          >
            Nombre
          </label>
          <input
            id={`carpeta-nombre-${folder.id}`}
            name="name"
            type="text"
            required
            maxLength={80}
            defaultValue={folder.name}
            className="mt-1 h-9 w-full max-w-sm border border-line bg-white px-3 text-sm"
          />
        </div>
        <SubmitButton variant="secondary" pendingLabel="Guardando...">
          Renombrar
        </SubmitButton>
      </form>

      <div className="mt-2">
        <FormMessage state={renameState} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-3">
        <p className="text-xs text-ink-soft">
          {scoreCount === 0
            ? "Carpeta vacía."
            : `${scoreCount} partitura${scoreCount === 1 ? "" : "s"}.`}
        </p>

        <form action={deleteAction}>
          <input type="hidden" name="folderId" value={folder.id} />
          <input type="hidden" name="intencion" value="eliminar" />
          {scoreCount > 0 ? (
            <input type="hidden" name="mover" value="1" />
          ) : null}
          <SubmitButton
            variant="danger"
            pendingLabel="Eliminando..."
            confirmMessage={
              scoreCount > 0
                ? `¿Eliminar «${folder.name}» y mover ${scoreCount} partitura${scoreCount === 1 ? "" : "s"} a «Sin carpeta»?`
                : `¿Eliminar la carpeta «${folder.name}»?`
            }
          >
            {scoreCount > 0 ? "Eliminar y mover a Sin carpeta" : "Eliminar carpeta"}
          </SubmitButton>
        </form>
      </div>

      {scoreCount > 0 ? (
        <p className="mt-2 text-xs text-ink-soft">
          Si no quieres mover las partituras, cancela la confirmación.
        </p>
      ) : null}

      <div className="mt-2">
        <FormMessage state={deleteState} />
      </div>
    </li>
  );
}
