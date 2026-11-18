import type { ActionState } from "@/lib/admin/action-state";

export function FormMessage({ state }: { state: ActionState }) {
  if (!state.error && !state.warning && !state.message) {
    return null;
  }

  return (
    <div className="space-y-1 text-sm" role="status" aria-live="polite">
      {state.error ? (
        <p className="border border-clay/30 bg-clay-soft px-3 py-2 text-clay">
          {state.error}
        </p>
      ) : null}
      {state.warning ? (
        <p className="border border-line bg-paper-deep px-3 py-2 text-ink-soft">
          {state.warning}
        </p>
      ) : null}
      {state.message ? (
        <p className="border border-moss/25 bg-moss-soft px-3 py-2 text-moss">
          {state.message}
        </p>
      ) : null}
      {state.fieldErrors
        ? Object.values(state.fieldErrors).map((message) => (
            <p key={message} className="text-clay">
              {message}
            </p>
          ))
        : null}
    </div>
  );
}
