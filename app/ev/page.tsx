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

const cardClass = {
  efficient: "rounded-xl px-5 py-4 shadow-sm ring-1 transition-all cursor-pointer bg-emerald-50 ring-emerald-200 dark:bg-emerald-950 dark:ring-emerald-800",
  inefficient: "rounded-xl px-5 py-4 shadow-sm ring-1 transition-all cursor-pointer bg-rose-50 ring-rose-200 dark:bg-rose-950 dark:ring-rose-800",
  normal: "rounded-xl px-5 py-4 shadow-sm ring-1 transition-all cursor-pointer bg-white ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800",
};

async function getEntries(): Promise<EvEntry[]> {
  const sql = neon(process.env.DATABASE_URL!);
  return await sql`SELECT * FROM tracking.ev ORDER BY date DESC` as EvEntry[];
}

export default async function EvPage() {
  const session = await getServerSession();
  if (!session) redirect("/api/auth/signin");

  const sql = neon(process.env.DATABASE_URL!);

  const [entries, statsResult] = await Promise.all([
    sql`SELECT * FROM tracking.ev ORDER BY date DESC`,
    sql`
      SELECT 
        AVG((kwh * 1000.0) / NULLIF(miles, 0)) AS mean,
        STDDEV((kwh * 1000.0) / NULLIF(miles, 0)) AS stddev
      FROM tracking.ev
    `,
  ]);

  const mean = parseFloat(statsResult[0].mean ?? "0");
  const stddev = parseFloat(statsResult[0].stddev ?? "0");

  const getEfficiency = (entry: EvEntry) => {
    const miles = parseFloat(entry.miles.toString());
    const kwh = parseFloat(entry.kwh.toString());
    return miles > 0 && kwh > 0 ? (kwh * 1000) / miles : null;
  };

  const tag = (entry: EvEntry) => {
    const e = getEfficiency(entry);
    if (!e || !stddev) return "normal";
    if (e < mean - stddev) return "efficient";
    if (e > mean + stddev) return "inefficient";
    return "normal";
  };

  console.log("mean:", mean, "stddev:", stddev);
  console.log("sample efficiencies:", (entries as EvEntry[]).slice(0, 3).map(e => getEfficiency(e)));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">EV Tracker</h1>
            <p className="mt-1 text-sm text-zinc-500">All charges</p>
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
          {(entries as EvEntry[]).map((entry) => {
            const t = tag(entry);
            const whPerMile = getEfficiency(entry);

            return (
              <Link key={entry.id} href={`/ev/${entry.id}`} className="block">
                <div className={cardClass[t]}>
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
                    {whPerMile && <span>{whPerMile.toFixed(0)} Wh/mi</span>}
                    {entry.total_kwh && (
                      <>
                        <span>·</span>
                        <span>{parseFloat(entry.total_kwh.toString()).toFixed(1)} kWh total</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}