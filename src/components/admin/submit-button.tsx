"use client";

import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  confirmMessage?: string;
}

const VARIANTS = {
  primary: "bg-moss text-paper hover:bg-ink",
  secondary: "border border-line bg-white hover:border-moss hover:text-moss",
  danger: "border border-clay/40 bg-clay-soft text-clay hover:border-clay",
} as const;

export function SubmitButton({
  children,
  pendingLabel = "Guardando...",
  variant = "primary",
  className = "",
  confirmMessage,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className={`inline-flex h-9 items-center justify-center px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
