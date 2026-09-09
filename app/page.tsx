import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { authOptions, canEdit } from "@/lib/auth";
import { PageShell, PageHeader, PillLink } from "@/components/layout";
import { StatCard } from "@/components/cards";
import { formatDate } from "@/lib/format";

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
        ? `${pace} min/mi · ${formatDate(stats.lastRun.date)}${stats.lastRun.location ? ` · ${stats.lastRun.location}` : ""}`
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
        ? `${parseFloat(stats.ev.lastCharge.kwh).toFixed(1)} kWh · ${formatDate(stats.ev.lastCharge.date)}`
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
    <PageShell>
      <PageHeader
        className="mb-10"
        title="Running Tracker"
        subtitle={
          <>
            <p className="mt-1 text-sm text-zinc-500">Welcome back, {session.user?.name?.split(" ")[0]}.</p>
            <a href="/api/auth/signout" className="text-sm text-zinc-400 hover:text-zinc-600">
              Sign out
            </a>
          </>
        }
        actions={
          <>
            <PillLink href="/runs">All runs</PillLink>
            {editable && <PillLink href="/runs/add" variant="solid">+ Log run</PillLink>}
            <PillLink href="/ev">EV log</PillLink>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4">
        {cards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} sub={card.sub} />
        ))}
      </div>
    </PageShell>
  );
}
