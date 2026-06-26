"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AddRun() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/api/auth/signin");
  }, [status, router]);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    miles: "",
    minutes: "",
    location: "",
    zip: "",
    shoes: "",
    treadmill: false,
    race: false,
    ioana: false,
    stroller: false,
  });

  const set = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit() {
    if (!form.date || !form.miles || !form.minutes || !form.shoes) {
      alert("Date, miles, minutes, and shoes are required.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push("/runs");
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Log a run</h1>
          <p className="mt-1 text-sm text-zinc-500">Add a new entry to your running log.</p>
        </div>

        <div className="space-y-5 rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800">

          {/* Date / Miles / Minutes */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" className={inputClass} value={form.date}
                onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Miles</label>
              <input type="number" step="0.01" placeholder="3.1" className={inputClass}
                value={form.miles} onChange={(e) => set("miles", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Minutes</label>
              <input type="number" step="0.1" placeholder="28.5" className={inputClass}
                value={form.minutes} onChange={(e) => set("minutes", e.target.value)} />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>Location</label>
            <input type="text" placeholder="Charles River" className={inputClass}
              value={form.location} onChange={(e) => set("location", e.target.value)} />
          </div>

          {/* Zip / Shoes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Zip</label>
              <input type="text" maxLength={5} placeholder="02134" className={inputClass}
                value={form.zip} onChange={(e) => set("zip", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Shoes</label>
              <input type="text" placeholder="NB860" className={inputClass}
                value={form.shoes} onChange={(e) => set("shoes", e.target.value)} />
            </div>
          </div>

          {/* Toggles */}
          <div>
            <p className={labelClass}>Tags</p>
            <div className="grid grid-cols-2 gap-3 mt-1">
              {(["treadmill", "race", "ioana", "stroller"] as const).map((field) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => set(field, !form[field])}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    form[field]
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${form[field] ? "bg-white dark:bg-zinc-900" : "bg-zinc-300 dark:bg-zinc-600"}`} />
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {loading ? "Saving…" : "Save run"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <a href="/runs" className="text-sm text-zinc-400 hover:text-zinc-600">← Back to runs</a>
        </div>
      </div>
    </div>
  );
}