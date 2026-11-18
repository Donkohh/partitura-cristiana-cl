"use client";

import { useActionState } from "react";
import { iniciarSesionAdmin, type LoginState } from "@/lib/auth/actions";
import { SubmitButton } from "./submit-button";

const INITIAL_STATE: LoginState = {};

export function LoginForm({ redirigirA }: { redirigirA?: string }) {
  const [state, formAction] = useActionState(iniciarSesionAdmin, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4">
      {redirigirA ? (
        <input type="hidden" name="redirigirA" value={redirigirA} />
      ) : null}

      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="mt-1 h-10 w-full border border-line bg-white px-3 text-sm"
        />
        {state.fieldErrors?.email ? (
          <p className="mt-1 text-xs text-clay">{state.fieldErrors.email}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 h-10 w-full border border-line bg-white px-3 text-sm"
        />
        {state.fieldErrors?.password ? (
          <p className="mt-1 text-xs text-clay">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      {state.error ? (
        <p className="border border-clay/30 bg-clay-soft px-3 py-2 text-sm text-clay">
          {state.error}
        </p>
      ) : null}

      <SubmitButton className="w-full" pendingLabel="Entrando...">
        Entrar
      </SubmitButton>
    </form>
  );
}
