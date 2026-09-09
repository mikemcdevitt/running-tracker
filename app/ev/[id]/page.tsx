"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRequireSession } from "@/lib/hooks";
import { PageShell, BackLink } from "@/components/layout";
import { FormCard, FormField, SubmitButton } from "@/components/form";
import { DerivedStat } from "@/components/cards";

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
  const { session, status, editable } = useRequireSession();
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
    async function fetchEntry() {
      const res = await fetch(`/api/ev/${id}`);
      if (!res.ok) {
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

  const set = (field: string, value: string) => {
    if (!editable) return;
    setForm((f) => ({ ...f, [field]: value }));
  };

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
    if (!editable) return;
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

  return (
    <PageShell maxWidth="max-w-lg" compactOnMobile>
      <div className="mb-8 px-5 pt-10 sm:px-0 sm:pt-0">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Charge detail</h1>
        <p className="mt-1 text-sm text-zinc-500">{editable ? "Edit or review this entry." : "View-only."}</p>
      </div>

      {(avgSpeed || miPer100Wh) && (
        <div className="grid grid-cols-3 gap-3 mb-5 px-5 sm:px-0">
          {avgSpeed && <DerivedStat label="Avg speed" value={avgSpeed} unit="mph" />}
          {kwhPer100Mile && <DerivedStat label="Efficiency" value={kwhPer100Mile} unit="kWh/100mi" />}
          {miPer100Wh && <DerivedStat label="Mi/100Wh" value={miPer100Wh} unit="mi/100Wh" />}
        </div>
      )}

      <FormCard>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Date" type="date" value={form.date} disabled={!editable} onChange={(e) => set("date", e.target.value)} />
          <FormField label="Miles" type="number" step="0.1" value={form.miles} disabled={!editable} onChange={(e) => set("miles", e.target.value)} />
          <FormField label="kWh" type="number" step="0.1" value={form.kwh} disabled={!editable} onChange={(e) => set("kwh", e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Hours driven" type="number" step="1" min="0" placeholder="2" value={form.hours} disabled={!editable} onChange={(e) => set("hours", e.target.value)} />
          <FormField label="Minutes driven" type="number" step="1" min="0" max="59" placeholder="30" value={form.mins} disabled={!editable} onChange={(e) => set("mins", e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Odometer" type="number" step="0.1" value={form.odo} disabled={!editable} onChange={(e) => set("odo", e.target.value)} />
          <FormField label="Total kWh" type="number" step="0.1" value={form.total_kwh} disabled={!editable} onChange={(e) => set("total_kwh", e.target.value)} />
        </div>

        {editable && (
          <SubmitButton loading={saving} onClick={handleSave}>Save changes</SubmitButton>
        )}
      </FormCard>

      <BackLink href="/ev">← Back to EV log</BackLink>
    </PageShell>
  );
}
