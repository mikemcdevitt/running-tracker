import Link from "next/link";
import { neon } from "@neondatabase/serverless";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, canEdit } from "@/lib/auth";

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
    <div className="min-h-screen bg-zinc-50 dark:bg-black px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Recent runs</h1>
            <p className="mt-1 text-sm text-zinc-500">Last 30 entries</p>
          </div>
          {editable && (
            <Link
              href="/add"
              className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              + Log run
            </Link>
          )}
        </div>

        <div className="space-y-3">
          {runs.map((run) => {
            const pace = run.miles > 0 ? (run.minutes / run.miles).toFixed(2) : "—";
            const tags = (["treadmill", "race", "ioana", "stroller"] as const).filter((t) => run[t]);
            return (
              <div
                key={run.id}
                className={`rounded-xl px-5 py-4 shadow-sm ring-1 ${run.race
                    ? "bg-amber-50 ring-amber-200 dark:bg-amber-950 dark:ring-amber-800"
                    : "bg-white ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {new Date(run.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}