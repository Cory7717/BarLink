"use client";

import { useEffect, useState } from "react";

type PromoCode = {
  id: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  maxRedemptions?: number | null;
  usedCount: number;
  expiresAt?: string | null;
  grantPlan?: string | null;
  grantMonths?: number | null;
};

export default function AdminPromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ code: "", description: "", maxRedemptions: "", grantPlan: "", grantMonths: "" });

  const load = async () => {
    const res = await fetch("/api/admin/promocodes");
    const data = await res.json();
    setCodes(data.codes || []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promocodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim(),
          description: form.description || undefined,
          maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
          grantPlan: form.grantPlan || undefined,
          grantMonths: form.grantMonths ? Number(form.grantMonths) : undefined,
        }),
      });
      if (res.ok) {
        setForm({ code: "", description: "", maxRedemptions: "", grantPlan: "", grantMonths: "" });
        await load();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-3xl p-4">
        <h2 className="mb-3 text-xl font-semibold text-gradient">Create promo code</h2>
        <form onSubmit={create} className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400"
            placeholder="CODE"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
          <input
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400"
            placeholder="Max redemptions"
            value={form.maxRedemptions}
            onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
              value={form.grantPlan}
              onChange={(e) => setForm({ ...form, grantPlan: e.target.value })}
              aria-label="Grant plan"
            >
              <option value="">Grant plan...</option>
              <option value="MONTHLY">MONTHLY</option>
              <option value="SIX_MONTH">SIX_MONTH</option>
              <option value="YEARLY">YEARLY</option>
            </select>
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400"
              placeholder="Grant months (optional)"
              value={form.grantMonths}
              onChange={(e) => setForm({ ...form, grantMonths: e.target.value })}
            />
          </div>
          <button disabled={loading} className="btn-primary px-4 py-2 text-sm">
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      <div className="glass-panel rounded-3xl p-4">
        <h2 className="mb-3 text-xl font-semibold text-gradient">Promo codes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-300">
              <tr>
                <th className="py-2">Code</th>
                <th>Description</th>
                <th>Uses</th>
                <th>Max</th>
                <th>Plan</th>
                <th>Months</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {codes.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 font-mono">{c.code}</td>
                  <td className="py-2">{c.description || ""}</td>
                  <td className="py-2">{c.usedCount}</td>
                  <td className="py-2">{c.maxRedemptions ?? "∞"}</td>
                  <td className="py-2">{c.grantPlan ?? ""}</td>
                  <td className="py-2">{c.grantMonths ?? ""}</td>
                  <td className="py-2">{c.isActive ? "Active" : "Disabled"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
