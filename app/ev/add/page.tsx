"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRequireEditor } from "@/lib/hooks";
import { PageShell, BackLink } from "@/components/layout";
import { FormCard, FormField, SubmitButton } from "@/components/form";

export default function AddEv() {
  const { ready } = useRequireEditor("/ev");
  const router = useRouter();

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
    async function fetchDefaults() {
      const res = await fetch("/api/ev/latest");
      if (res.ok) {
        const { date, odo, total_kwh } = await res.json();
        setBaselines({ odo, total_kwh });
        setForm((f) => ({ ...f, date, odo: odo.toString(), total_kwh: total_kwh.toString() }));
      }
    }
    if (ready) fetchDefaults();
  }, [ready]);

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

  if (!ready) return null;

  return (
    <PageShell maxWidth="max-w-lg" compactOnMobile>
      <div className="mb-8 px-5 sm:px-0 sm:pt-0">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Log a charge</h1>
        <p className="mt-1 text-sm text-zinc-500">Add a new entry to your EV log.</p>
      </div>

      <FormCard>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
          <FormField label="Miles" type="number" step="0.1" placeholder="195" value={form.miles} onChange={(e) => set("miles", e.target.value)} />
          <FormField label="kWh" type="number" step="0.1" placeholder="60" value={form.kwh} onChange={(e) => set("kwh", e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Odometer" type="number" step="1" placeholder="12345" value={form.odo} onChange={(e) => set("odo", e.target.value)} />
          <FormField label="Total kWh" type="number" step="0.1" placeholder="1250" value={form.total_kwh} onChange={(e) => set("total_kwh", e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Hours driven" type="number" step="1" min="0" placeholder="2" value={form.hours} onChange={(e) => set("hours", e.target.value)} />
          <FormField label="Minutes driven" type="number" step="1" min="0" max="59" placeholder="30" value={form.mins} onChange={(e) => set("mins", e.target.value)} />
        </div>

        <SubmitButton loading={loading} onClick={handleSubmit}>Save charge</SubmitButton>
      </FormCard>

      <BackLink href="/ev">← Back to EV log</BackLink>
    </PageShell>
  );
}
