"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRequireEditor } from "@/lib/hooks";
import { PageShell, BackLink } from "@/components/layout";
import { FormCard, FormField, SubmitButton, ToggleField } from "@/components/form";

const TAGS = ["treadmill", "race", "ioana", "stroller"] as const;

export default function AddRun() {
  const { ready } = useRequireEditor("/runs");
  const router = useRouter();

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

  if (!ready) return null;

  return (
    <PageShell maxWidth="max-w-lg" compactOnMobile>
      <div className="mb-8 px-5 pt-10 sm:px-0 sm:pt-0">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Log a run</h1>
        <p className="mt-1 text-sm text-zinc-500">Add a new entry to your running log.</p>
      </div>

      <FormCard>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
          <FormField label="Miles" type="number" step="0.01" placeholder="3.1" value={form.miles} onChange={(e) => set("miles", e.target.value)} />
          <FormField label="Minutes" type="number" step="0.1" placeholder="28.5" value={form.minutes} onChange={(e) => set("minutes", e.target.value)} />
        </div>

        <FormField label="Location" type="text" placeholder="Charles River" value={form.location} onChange={(e) => set("location", e.target.value)} />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Zip" type="text" maxLength={5} placeholder="02134" value={form.zip} onChange={(e) => set("zip", e.target.value)} />
          <FormField label="Shoes" type="text" placeholder="NB860" value={form.shoes} onChange={(e) => set("shoes", e.target.value)} />
        </div>

        <div>
          <p className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tags</p>
          <div className="grid grid-cols-2 gap-3 mt-1">
            {TAGS.map((field) => (
              <ToggleField
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                active={form[field]}
                onClick={() => set(field, !form[field])}
              />
            ))}
          </div>
        </div>

        <SubmitButton loading={loading} onClick={handleSubmit}>Save run</SubmitButton>
      </FormCard>

      <BackLink href="/runs">← Back to runs</BackLink>
    </PageShell>
  );
}
