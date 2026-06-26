import { neon } from "@neondatabase/serverless";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type EvEntry = {
  id: number;
  date: string;
  miles: number;
  kwh: number;
  odo: number | null;
  total_kwh: number | null;
};

async function getEntries(): Promise<EvEntry[]> {
  const sql = neon(process.env.DATABASE_URL!);
  return await sql`SELECT * FROM tracking.ev ORDER BY date DESC LIMIT 30` as EvEntry[];
}

export default async function EvPage() {
  const session = await getServerSession();
  if (!session) redirect("/api/auth/signin");

  const entries = await getEntries();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">EV Tracker</h1>
            <p className="mt-1 text-sm text-zinc-500">Last 30 charges</p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
              Home
            </Link>
            <Link href="/ev/add" className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900">
              + Log charge
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          {entries.map((entry) => {
            const efficiency = entry.miles > 0 && entry.kwh > 0
              ? (entry.miles / entry.kwh).toFixed(2)
              : null;
            return (
              <div key={entry.id} className="rounded-xl bg-white dark:bg-zinc-900 px-5 py-4 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {new Date(entry.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                    </p>
                    {entry.odo && (
                      <p className="mt-0.5 text-sm text-zinc-500">{parseFloat(entry.odo.toString()).toLocaleString()} mi odometer</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{parseFloat(entry.miles.toString()).toFixed(1)} mi</p>
                    <p className="text-xs text-zinc-400">{parseFloat(entry.kwh.toString()).toFixed(1)} kWh</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400">
                  {efficiency && <span>{efficiency} mi/kWh</span>}
                  {entry.total_kwh && (
                    <>
                      <span>·</span>
                      <span>{parseFloat(entry.total_kwh.toString()).toFixed(1)} kWh total</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}