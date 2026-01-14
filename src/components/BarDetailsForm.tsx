'use client';

import { useState } from "react";

type BarDetailsFormProps = {
  barId: string;
  initial: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string | null;
    website: string | null;
    description: string | null;
    barType: string | null;
  };
  barTypes: string[];
};

export default function BarDetailsForm({ barId, initial, barTypes }: BarDetailsFormProps) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/bars/${barId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save");
      }
      setStatus("Saved");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-slate-200">
          Bar name
          <input className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.name} onChange={handleChange("name")} />
        </label>
        <label className="text-sm text-slate-200">
          Bar type
          <select className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.barType ?? ""} onChange={handleChange("barType")}>
            {barTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="text-sm text-slate-200">
        Address
        <input className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.address} onChange={handleChange("address")} />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm text-slate-200">
          City
          <input className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.city} onChange={handleChange("city")} />
        </label>
        <label className="text-sm text-slate-200">
          State
          <input className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.state} onChange={handleChange("state")} />
        </label>
        <label className="text-sm text-slate-200">
          Zip
          <input className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.zipCode} onChange={handleChange("zipCode")} />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-slate-200">
          Phone
          <input className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.phone ?? ""} onChange={handleChange("phone")} />
        </label>
        <label className="text-sm text-slate-200">
          Website
          <input className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" value={form.website ?? ""} onChange={handleChange("website")} />
        </label>
      </div>
      <label className="text-sm text-slate-200">
        Description
        <textarea className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" rows={3} value={form.description ?? ""} onChange={handleChange("description")} />
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary px-4 py-2 text-sm" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        {status && <span className="text-xs text-slate-300">{status}</span>}
      </div>
    </form>
  );
}
