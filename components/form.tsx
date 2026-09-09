import type { InputHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { inputClass, labelClass } from "@/lib/ui";

/** Labeled input, styled consistently across every add/edit form. */
export function FormField({
  label,
  className,
  ...props
}: { label: string; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      <input className={inputClass} {...props} />
    </div>
  );
}

/** White rounded card wrapping a form's fields (full-bleed on mobile, inset on larger screens). */
export function FormCard({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-5 rounded-none sm:rounded-2xl bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm sm:ring-1 ring-zinc-100 dark:ring-zinc-800">
      {children}
    </div>
  );
}

/** Primary submit button with a built-in "Saving…" loading state. */
export function SubmitButton({
  loading,
  children,
  ...props
}: { loading: boolean; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={loading}
      className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      {...props}
    >
      {loading ? "Saving…" : children}
    </button>
  );
}

/** Boolean tag toggle used by the run form (treadmill, race, ioana, stroller). */
export function ToggleField({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
          : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${active ? "bg-white dark:bg-zinc-900" : "bg-zinc-300 dark:bg-zinc-600"}`} />
      {label}
    </button>
  );
}
