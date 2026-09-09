import { neon } from "@neondatabase/serverless";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions, canEdit } from "@/lib/auth";
import { PageShell, PageHeader, PillLink } from "@/components/layout";
import { EntryCard } from "@/components/cards";
import { formatDate, FULL_DATE } from "@/lib/format";

export const dynamic = "force-dynamic";

type EvEntry = {
  id: number;
  date: string;
  miles: number;
  kwh: number;
  odo: number | null;
  total_kwh: number | null;
};

export default async function EvPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  const editable = canEdit(session.user?.role);

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

  const tone = (entry: EvEntry): "emerald" | "rose" | "default" => {
    const e = getEfficiency(entry);
    if (!e || !stddev) return "default";
    if (e < mean - stddev) return "emerald";
    if (e > mean + stddev) return "rose";
    return "default";
  };

  return (
    <PageShell>
      <PageHeader
        title="EV Tracker"
        subtitle={<p className="mt-1 text-sm text-zinc-500">All charges</p>}
        actions={
          <>
            <PillLink href="/">Home</PillLink>
            {editable && <PillLink href="/ev/add" variant="solid">+ Log charge</PillLink>}
          </>
        }
      />

      <div className="space-y-3">
        {(entries as EvEntry[]).map((entry) => {
          const whPerMile = getEfficiency(entry);

          return (
            <Link key={entry.id} href={`/ev/${entry.id}`} className="block">
              <EntryCard tone={tone(entry)}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {formatDate(entry.date, FULL_DATE)}
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
              </EntryCard>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
