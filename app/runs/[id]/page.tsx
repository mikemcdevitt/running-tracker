"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRequireSession } from "@/lib/hooks";
import { PageShell, BackLink } from "@/components/layout";
import { FormCard, FormField, SubmitButton, ToggleField } from "@/components/form";
import { DerivedStat } from "@/components/cards";

type RunEntry = {
  id: number;
  date: string;
  miles: string;
  minutes: string;
  location: string | null;
  zip: string | null;
  shoes: string;
  treadmill: boolean;
  race: boolean;
  ioana: boolean;
  stroller: boolean;
};

const TAGS = ["treadmill", "race", "ioana", "stroller"] as const;

export default function RunDetail() {
  const { session, status, editable } = useRequireSession();
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: "",
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

  useEffect(() => {
    async function fetchEntry() {
      const res = await fetch(`/api/runs/${id}`);
      if (!res.ok) {
        router.push("/runs");
        return;
      }
      const entry: RunEntry = await res.json();
      setForm({
        date: entry.date.split("T")[0],
        miles: entry.miles,
        minutes: entry.minutes,
        location: entry.location ?? "",
        zip: entry.zip ?? "",
        shoes: entry.shoes,
        treadmill: entry.treadmill,
        race: entry.race,
        ioana: entry.ioana,
        stroller: entry.stroller,
      });
      setLoading(false);
    }
    if (status === "authenticated") fetchEntry();
  }, [status, id]);

  const set = (field: string, value: string | boolean) => {
    if (!editable) return;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const miles = parseFloat(form.miles) || 0;
  const minutes = parseFloat(form.minutes) || 0;
  const pace = miles > 0 ? (minutes / miles).toFixed(2) : null;

  async function handleSave() {
    if (!editable) return;
    setSaving(true);
    const res = await fetch(`/api/runs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push("/runs");
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
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Run detail</h1>
        <p className="mt-1 text-sm text-zinc-500">{editable ? "Edit or review this entry." : "View-only."}</p>
      </div>

      {pace && (
        <div className="mb-5 px-5 sm:px-0">
          <DerivedStat label="Pace" value={pace} unit="min/mi" />
        </div>
      )}

      <FormCard>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Date" type="date" value={form.date} disabled={!editable} onChange={(e) => set("date", e.target.value)} />
          <FormField label="Miles" type="number" step="0.01" value={form.miles} disabled={!editable} onChange={(e) => set("miles", e.target.value)} />
          <FormField label="Minutes" type="number" step="0.1" value={form.minutes} disabled={!editable} onChange={(e) => set("minutes", e.target.value)} />
        </div>

        <FormField label="Location" type="text" value={form.location} disabled={!editable} onChange={(e) => set("location", e.target.value)} />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Zip" type="text" maxLength={5} value={form.zip} disabled={!editable} onChange={(e) => set("zip", e.target.value)} />
          <FormField label="Shoes" type="text" value={form.shoes} disabled={!editable} onChange={(e) => set("shoes", e.target.value)} />
        </div>

        <div>
          <p className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tags</p>
          <div className="grid grid-cols-2 gap-3 mt-1">
            {TAGS.map((field) => (
              <ToggleField
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                active={form[field]}
                disabled={!editable}
                onClick={() => set(field, !form[field])}
              />
            ))}
          </div>
        </div>

        {editable && (
          <SubmitButton loading={saving} onClick={handleSave}>Save changes</SubmitButton>
        )}
      </FormCard>

      <BackLink href="/runs">← Back to runs</BackLink>
    </PageShell>
  );
}
