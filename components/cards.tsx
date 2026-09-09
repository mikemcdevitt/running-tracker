import type { ReactNode } from "react";

type Tone = "default" | "amber" | "emerald" | "rose";

const toneClasses: Record<Tone, string> = {
  default: "bg-white ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800",
  amber: "bg-amber-50 ring-amber-200 dark:bg-amber-950 dark:ring-amber-800",
  emerald: "bg-emerald-50 ring-emerald-200 dark:bg-emerald-950 dark:ring-emerald-800",
  rose: "bg-rose-50 ring-rose-200 dark:bg-rose-950 dark:ring-rose-800",
};

/** Clickable list-row card (a run, an EV charge), with a tone for highlighting (race, efficient/inefficient). */
export function EntryCard({ tone = "default", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div className={`rounded-xl px-5 py-4 shadow-sm ring-1 transition-all cursor-pointer ${toneClasses[tone]}`}>
      {children}
    </div>
  );
}

/** Dashboard stat tile (label, big value, small sub-line). */
export function StatCard({ label, value, sub }: { label: string; value: string; sub?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 px-6 py-5 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-400">{sub}</p>}
    </div>
  );
}

/** Small centered stat shown above a detail/edit form (pace, avg speed, efficiency). */
export function DerivedStat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900 px-4 py-3 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800 text-center">
      <p className="text-xs text-zinc-400 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
      <p className="text-xs text-zinc-400">{unit}</p>
    </div>
  );
}
