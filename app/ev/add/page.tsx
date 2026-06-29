"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AddEv() {

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/api/auth/signin");
  }, [status, router]);

  const [loading, setLoading] = useState(false);
  const [baselines, setBaselines] = useState({ odo: 0, total_kwh: 0 });
  const [form, setForm] = useState({
    date: "",
    miles: "",
    kwh: "",
    odo: "",
    total_kwh: "",
    hours: "",
    mins: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/api/auth/signin");
  }, [status, router]);

  useEffect(() => {
    async function fetchDefaults() {
      const res = await fetch("/api/ev/latest");
      if (res.ok) {
        const { date, odo, total_kwh, minutes } = await res.json();
        setBaselines({ odo, total_kwh });
        setForm((f) => ({ ...f, date, odo: odo.toString(), total_kwh: total_kwh.toString() }));
      }
    }
    if (status === "authenticated") fetchDefaults();
  }, [status]);

  useEffect(() => {
    const miles = parseFloat(form.miles);
    const kwh = parseFloat(form.kwh);
    if (!isNaN(miles) && !isNaN(kwh)) {
      setForm((f) => ({
        ...f,
        odo: (baselines.odo + miles).toFixed(1),
        total_kwh: (baselines.total_kwh + kwh).toFixed(2),
      }));
    }
  }, [form.miles, form.kwh]);

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit() {
    if (!form.date || !form.miles || !form.kwh) {
      alert("Date, miles, and kWh are required.");
      return;
    }
    setLoading(true);

    const hours = parseFloat(form.hours) || 0;
    const mins = parseFloat(form.mins) || 0;
    const totalMinutes = hours * 60 + mins || null;
    const res = await fetch("/api/ev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, minutes: totalMinutes }),
    });
    if (res.ok) {
      router.push("/ev");
    } else {
      alert("Something went wrong.");
      setLoading(false);
    }
  }

  if (status === "loading") return null;
  if (!session) return null;

  const inputClass =
    "w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
  const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black px-0 py-0 sm:px-4 sm:py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 px-5 sm:px-0 sm:pt-0">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Log a charge</h1>
          <p className="mt-1 text-sm text-zinc-500">Add a new entry to your EV log.</p>
        </div>

        <div className="space-y-5 rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800">

          {/* Date / Miles / kWh */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" className={inputClass} value={form.date}
                onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Miles</label>
              <input type="number" step="0.1" placeholder="195" className={inputClass}
                value={form.miles} onChange={(e) => set("miles", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>kWh</label>
              <input type="number" step="0.1" placeholder="60" className={inputClass}
                value={form.kwh} onChange={(e) => set("kwh", e.target.value)} />
            </div>
          </div>

          {/* Odometer / Total kWh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Odometer</label>
              <input type="number" step="1" placeholder="12345" className={inputClass}
                value={form.odo} onChange={(e) => set("odo", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Total kWh</label>
              <input type="number" step="0.1" placeholder="1250" className={inputClass}
                value={form.total_kwh} onChange={(e) => set("total_kwh", e.target.value)} />
            </div>
          </div>

          {/* Time driven */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Hours driven</label>
              <input type="number" step="1" min="0" placeholder="2" className={inputClass}
                value={form.hours} onChange={(e) => set("hours", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Minutes driven</label>
              <input type="number" step="1" min="0" max="59" placeholder="30" className={inputClass}
                value={form.mins} onChange={(e) => set("mins", e.target.value)} />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {loading ? "Saving…" : "Save charge"}
          </button>
        </div>

        <div className="mt-4 text-center px-5 sm:px-0">
          <a href="/ev" className="text-sm text-zinc-400 hover:text-zinc-600">← Back to EV log</a>
        </div>
      </div>
    </div>
  );
}