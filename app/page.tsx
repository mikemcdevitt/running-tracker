import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Running Tracker</h1>
        <div className="mt-6 flex gap-4 justify-center">
          <Link href="/runs" className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900">
            View runs
          </Link>
          <Link href="/add" className="rounded-full border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300">
            Log a run
          </Link>
        </div>
      </div>
    </div>
  );
}