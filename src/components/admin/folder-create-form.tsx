"use client";

import { useActionState, useEffect, useRef } from "react";
import { INITIAL_ACTION_STATE } from "@/lib/admin/action-state";
import { crearCarpeta } from "@/lib/admin/folder-actions";
import { FormMessage } from "./form-message";
import { SubmitButton } from "./submit-button";

export function FolderCreateForm() {
  const [state, formAction] = useActionState(
    crearCarpeta,
    INITIAL_ACTION_STATE
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div>
        <label htmlFor="nueva-carpeta-nombre" className="text-sm font-medium">
          Nombre de la carpeta
        </label>
        <input
          id="nueva-carpeta-nombre"
          name="name"
          type="text"
          required
          maxLength={80}
          placeholder="Ej. Coro domingo"
          className="mt-1 h-10 w-full max-w-sm border border-line bg-white px-3 text-sm"
        />
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Creando...">Crear carpeta</SubmitButton>
    </form>
  );
}
