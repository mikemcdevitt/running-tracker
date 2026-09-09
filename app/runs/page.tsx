import Link from "next/link";
import { neon } from "@neondatabase/serverless";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, canEdit } from "@/lib/auth";
import { PageShell, PageHeader, PillLink } from "@/components/layout";
import { EntryCard } from "@/components/cards";
import { formatDate, FULL_DATE } from "@/lib/format";

export const dynamic = "force-dynamic";

async function getRuns() {
  const sql = neon(process.env.DATABASE_URL!);
  return await sql`SELECT * FROM tracking.runs ORDER BY date DESC LIMIT 30`;
}

type Run = {
  id: number;
  date: string;
  miles: number;
  minutes: number;
  location: string | null;
  shoes: string;
  treadmill: boolean;
  race: boolean;
  ioana: boolean;
  stroller: boolean;
};

export default async function RunsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  const editable = canEdit(session.user?.role);

  const runs = await getRuns();

  return (
    <PageShell>
      <PageHeader
        title="Recent runs"
        subtitle={<p className="mt-1 text-sm text-zinc-500">Last 30 entries</p>}
        actions={editable ? <PillLink href="/runs/add" variant="solid">+ Log run</PillLink> : undefined}
      />

      <div className="space-y-3">
        {runs.map((run) => {
          const pace = run.miles > 0 ? (run.minutes / run.miles).toFixed(2) : "—";
          const tags = (["treadmill", "race", "ioana", "stroller"] as const).filter((t) => run[t]);
          return (
            <Link key={run.id} href={`/runs/${run.id}`} className="block">
              <EntryCard tone={run.race ? "amber" : "default"}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {formatDate(run.date, FULL_DATE)}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-500">{run.location || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{run.miles} mi</p>
                    <p className="text-xs text-zinc-400">{pace} min/mi</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400">
                  <span>{run.minutes} min</span>
                  <span>·</span>
                  <span>{run.shoes}</span>
                  {tags.length > 0 && (
                    <>
                      <span>·</span>
                      {tags.map((t) => (
                        <span key={t} className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-zinc-500 dark:text-zinc-400">
                          {t}
                        </span>
                      ))}
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
