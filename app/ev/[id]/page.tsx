"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

type EvEntry = {
  id: number;
  date: string;
  miles: string;
  kwh: string;
  odo: string | null;
  total_kwh: string | null;
  minutes: string | null;
};

export default function EvDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    async function fetchEntry() {
      const res = await fetch(`/api/ev/${id}`);
      console.log("fetchEntry status:", res.status);
      if (!res.ok) { 
        console.log("fetchEntry failed, redirecting to /ev");
        router.push("/ev"); 
        return; 
      }
      const entry: EvEntry = await res.json();

      const totalMins = entry.minutes ? parseFloat(entry.minutes) : 0;
      const hours = Math.floor(totalMins / 60);
      const mins = Math.round(totalMins % 60);

      setForm({
        date: entry.date.split("T")[0],
        miles: entry.miles,
        kwh: entry.kwh,
        odo: entry.odo ?? "",
        total_kwh: entry.total_kwh ?? "",
        hours: hours > 0 ? hours.toString() : "",
        mins: mins > 0 ? mins.toString() : "",
      });
      setLoading(false);
    }
    if (status === "authenticated") fetchEntry();
  }, [status, id]);

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  // Derived stats
  const miles = parseFloat(form.miles) || 0;
  const kwh = parseFloat(form.kwh) || 0;
  const hours = parseFloat(form.hours) || 0;
  const mins = parseFloat(form.mins) || 0;
  const totalMinutes = hours * 60 + mins;
  const totalHours = totalMinutes / 60;

  const avgSpeed = totalHours > 0 ? (miles / totalHours).toFixed(1) : null;
  const miPer100Wh = kwh > 0 ? (miles / (kwh / 10)).toFixed(1) : null;
  const kwhPer100Mile = miles > 0 ? ((kwh) / (miles / 100)).toFixed(1) : null;

  async function handleSave() {
    setSaving(true);
    const totalMins = hours * 60 + mins || null;
    const res = await fetch(`/api/ev/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, minutes: totalMins }),
    });
    if (res.ok) {
      router.push("/ev");
    } else {
      alert("Something went wrong.");
      setSaving(false);
    }
  }

  if (status === "loading" || loading) return null;
  if (!session) return null;

  const inputClass =
    "w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
  const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black px-0 py-0 sm:px-4 sm:py-12">
      <div className="mx-auto max-w-lg">

        <div className="mb-8 px-5 pt-10 sm:px-0 sm:pt-0">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Charge detail</h1>
          <p className="mt-1 text-sm text-zinc-500">Edit or review this entry.</p>
        </div>

        {/* Calculated stats */}
        {(avgSpeed || miPer100Wh) && (
          <div className="grid grid-cols-3 gap-3 mb-5 px-5 sm:px-0">
            {avgSpeed && (
              <div className="rounded-xl bg-white dark:bg-zinc-900 px-4 py-3 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800 text-center">
                <p className="text-xs text-zinc-400 uppercase tracking-wide">Avg speed</p>
                <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{avgSpeed}</p>
                <p className="text-xs text-zinc-400">mph</p>
              </div>
            )}
            {kwhPer100Mile && (
              <div className="rounded-xl bg-white dark:bg-zinc-900 px-4 py-3 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800 text-center">
                <p className="text-xs text-zinc-400 uppercase tracking-wide">Efficiency</p>
                <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{kwhPer100Mile}</p>
                <p className="text-xs text-zinc-400">kWh/100mi</p>
              </div>
            )}
            {miPer100Wh && (
              <div className="rounded-xl bg-white dark:bg-zinc-900 px-4 py-3 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800 text-center">
                <p className="text-xs text-zinc-400 uppercase tracking-wide">Mi/100Wh</p>
                <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{miPer100Wh}</p>
                <p className="text-xs text-zinc-400">mi/100Wh</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-5 rounded-none sm:rounded-2xl bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm sm:ring-1 ring-zinc-100 dark:ring-zinc-800">

          {/* Date / Miles / kWh */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" className={inputClass} value={form.date}
                onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Miles</label>
              <input type="number" step="0.1" className={inputClass}
                value={form.miles} onChange={(e) => set("miles", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>kWh</label>
              <input type="number" step="0.1" className={inputClass}
                value={form.kwh} onChange={(e) => set("kwh", e.target.value)} />
            </div>
          </div>

          {/* Hours / Minutes */}
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

          {/* Odometer / Total kWh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Odometer</label>
              <input type="number" step="0.1" className={inputClass}
                value={form.odo} onChange={(e) => set("odo", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Total kWh</label>
              <input type="number" step="0.1" className={inputClass}
                value={form.total_kwh} onChange={(e) => set("total_kwh", e.target.value)} />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>

        <div className="mt-4 text-center px-5 sm:px-0">
          <a href="/ev" className="text-sm text-zinc-400 hover:text-zinc-600">← Back to EV log</a>
        </div>
      </div>
    </div>
  );
}