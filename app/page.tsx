import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import Link from "next/link";
import { authOptions, canEdit } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getStats() {
  const sql = neon(process.env.DATABASE_URL!);

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const yearStart = `${now.getFullYear()}-01-01`;

  const [monthly, yearly, overall, lastRun, evMonthly, evYearly, evLastCharge, evAllTime] = await Promise.all([
    sql`SELECT COALESCE(SUM(miles), 0) AS total FROM tracking.runs WHERE date >= ${monthStart}`,
    sql`SELECT COALESCE(SUM(miles), 0) AS total FROM tracking.runs WHERE date >= ${yearStart}`,
    sql`SELECT COALESCE(SUM(miles), 0) AS total FROM tracking.runs`,
    sql`SELECT date, miles, minutes, location FROM tracking.runs ORDER BY date DESC LIMIT 1`,
    sql`SELECT COALESCE(SUM(miles), 0) AS miles, COALESCE(SUM(kwh), 0) AS kwh FROM tracking.ev WHERE date >= ${monthStart}`,
    sql`SELECT COALESCE(SUM(miles), 0) AS miles, COALESCE(SUM(kwh), 0) AS kwh FROM tracking.ev WHERE date >= ${yearStart}`,
    sql`SELECT date, miles, kwh FROM tracking.ev ORDER BY date DESC LIMIT 1`,
    sql`SELECT COALESCE(SUM(miles), 0) AS miles, COALESCE(SUM(kwh), 0) AS kwh FROM tracking.ev`,
  ]);

  return {
    monthly: parseFloat(monthly[0].total),
    yearly: parseFloat(yearly[0].total),
    overall: parseFloat(overall[0].total),
    lastRun: lastRun[0] ?? null,
    ev: {
      monthly: { miles: parseFloat(evMonthly[0].miles), kwh: parseFloat(evMonthly[0].kwh) },
      yearly: { miles: parseFloat(evYearly[0].miles), kwh: parseFloat(evYearly[0].kwh) },
      lastCharge: evLastCharge[0] ?? null,
      allTime: { miles: parseFloat(evAllTime[0].miles), kwh: parseFloat(evAllTime[0].kwh) },
    },
    evAllTime: {
      miles: parseFloat(evAllTime[0].miles),
      kwh: parseFloat(evAllTime[0].kwh),
    },
  };
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  const editable = canEdit(session.user?.role);

  const stats = await getStats();

  const pace =
    stats.lastRun && stats.lastRun.miles > 0
      ? (stats.lastRun.minutes / stats.lastRun.miles).toFixed(2)
      : null;

  const cards = [
    {
      label: "This month",
      value: `${stats.monthly.toFixed(1)} mi`,
      sub: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
    },
    {
      label: "This year",
      value: `${stats.yearly.toFixed(1)} mi`,
      sub: new Date().getFullYear().toString(),
    },
    {
      label: "All time",
      value: `${stats.overall.toFixed(1)} mi`,
      sub: "total distance",
    },
    {
      label: "Last run",
      value: stats.lastRun ? `${parseFloat(stats.lastRun.miles).toFixed(1)} mi` : "—",
      sub: stats.lastRun
        ? `${pace} min/mi · ${new Date(stats.lastRun.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}${stats.lastRun.location ? ` · ${stats.lastRun.location}` : ""}`
        : "no runs yet",
    },
    {
      label: "EV this month",
      value: `${stats.ev.monthly.miles.toFixed(0)} mi`,
      sub: `${stats.ev.monthly.kwh.toFixed(1)} kWh · ${stats.ev.monthly.kwh > 0 ? (stats.ev.monthly.miles / stats.ev.monthly.kwh).toFixed(2) : "—"} mi/kWh`,
    },
    {
      label: "EV this year",
      value: `${stats.ev.yearly.miles.toFixed(0)} mi`,
      sub: `${stats.ev.yearly.kwh.toFixed(1)} kWh · ${stats.ev.yearly.kwh > 0 ? (stats.ev.yearly.miles / stats.ev.yearly.kwh).toFixed(2) : "—"} mi/kWh`,
    },
    {
      label: "Last charge",
      value: stats.ev.lastCharge ? `${parseFloat(stats.ev.lastCharge.miles).toFixed(0)} mi` : "—",
      sub: stats.ev.lastCharge
        ? `${parseFloat(stats.ev.lastCharge.kwh).toFixed(1)} kWh · ${new Date(stats.ev.lastCharge.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}`
        : "no charges yet",
    },
    {
      label: "EV efficiency",
      value: stats.ev.allTime.kwh > 0
        ? `${((stats.ev.allTime.kwh / stats.ev.allTime.miles) * 1000).toFixed(0)} Wh/mi`
        : "—",
      sub: `across ${stats.ev.allTime.miles.toFixed(0)} mi`,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black px-4 py-12">
      <div className="mx-auto max-w-2xl">

        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Running Tracker</h1>
            <p className="mt-1 text-sm text-zinc-500">Welcome back, {session.user?.name?.split(" ")[0]}.</p>
            <a href="/api/auth/signout" className="text-sm text-zinc-400 hover:text-zinc-600">
              Sign out
            </a>
          </div>
          <div className="flex gap-3">
            <Link href="/runs" className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
              All runs
            </Link>
            {editable && (
              <Link href="/add" className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900">
                + Log run
              </Link>
            )}
            <Link href="/ev" className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
              EV log
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-2xl bg-white dark:bg-zinc-900 px-6 py-5 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{card.value}</p>
              <p className="mt-1 text-xs text-zinc-400">{card.sub}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}