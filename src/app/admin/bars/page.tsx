"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type BarRow = {
  id: string;
  name: string;
  city: string;
  state: string;
  ownerEmail: string;
  tier?: string;
  addOn?: boolean;
  subscriptionStatus?: string | null;
  subscriptionPlan?: string | null;
  events?: number;
  offerings?: number;
};

export default function AdminBarsPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [activeOnly, setActiveOnly] = useState(searchParams.get("activeOnly") === "true");
  const [addOnOnly, setAddOnOnly] = useState(searchParams.get("addOn") === "true");
  const [tier, setTier] = useState(searchParams.get("tier") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [bars, setBars] = useState<BarRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const search = async () => {
    setLoading(true);
    setMessage(null);
    try {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (city) params.set("city", city);
    if (activeOnly) params.set("activeOnly", "true");
    if (addOnOnly) params.set("addOn", "true");
    if (tier) params.set("tier", tier);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/bars?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setBars(data.bars || []);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // auto-load when arriving with query params
    const hasPrefill = !!(query || city || activeOnly);
    if (hasPrefill) {
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeBar = async (barId: string) => {
    if (!confirm("Remove this bar? This action cannot be undone.")) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/bars`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setBars((prev) => prev.filter((b) => b.id !== barId));
      setMessage("Bar removed.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-3xl font-semibold text-gradient">Bars</h1>
        <div className="flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, slug, owner email"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Filter by city"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          />
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white text-sm"
          >
            <option value="">Any tier</option>
            <option value="FREE">Free</option>
            <option value="PRO">Pro</option>
            <option value="PREMIUM">Premium</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white text-sm"
          >
            <option value="">Any status</option>
            <option value="ACTIVE">Active</option>
            <option value="PAST_DUE">Past due</option>
            <option value="CANCELED">Canceled</option>
            <option value="TRIALING">Trialing</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />
            Active subscription only
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={addOnOnly} onChange={(e) => setAddOnOnly(e.target.checked)} />
            Inventory add-on
          </label>
          <button onClick={search} disabled={loading} className="btn-secondary px-4 py-2 text-sm">
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>
      {message && <p className="text-sm text-slate-300">{message}</p>}
      <div className="glass-panel rounded-3xl p-4 shadow-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-300">
            <tr>
              <th className="px-2 py-1">Name</th>
              <th className="px-2 py-1">City</th>
              <th className="px-2 py-1">Owner</th>
              <th className="px-2 py-1">Tier</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Add-on</th>
              <th className="px-2 py-1">Events</th>
              <th className="px-2 py-1">Offerings</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bars.map((bar) => (
              <tr key={bar.id} className="border-t border-white/5 text-slate-200">
                <td className="px-2 py-2">{bar.name}</td>
                <td className="px-2 py-2">
                  {bar.city}, {bar.state}
                </td>
                <td className="px-2 py-2">{bar.ownerEmail}</td>
                <td className="px-2 py-2">{bar.tier || "FREE"}</td>
                <td className="px-2 py-2">{bar.subscriptionStatus || "—"}</td>
                <td className="px-2 py-2">{bar.addOn ? "Inventory" : "None"}</td>
                <td className="px-2 py-2">{bar.events ?? 0}</td>
                <td className="px-2 py-2">{bar.offerings ?? 0}</td>
                <td className="px-2 py-2">
                  <button
                    className="btn-secondary px-3 py-1 text-xs"
                    onClick={() => removeBar(bar.id)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                  <a href={`/admin/bars/${bar.id}`} className="ml-2 text-xs text-cyan-200 hover:text-cyan-100">
                    Details
                  </a>
                </td>
              </tr>
            ))}
            {bars.length === 0 && (
              <tr>
                <td className="px-2 py-2 text-slate-400" colSpan={4}>
                  No results yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
