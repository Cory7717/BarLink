"use client";

import { useState } from "react";

type BarRow = {
  id: string;
  name: string;
  city: string;
  state: string;
  ownerEmail: string;
};

export default function AdminBarsPage() {
  const [query, setQuery] = useState("");
  const [bars, setBars] = useState<BarRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const search = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/bars?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setBars(data.bars || []);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

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
            placeholder="Search by name"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          />
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
                <td className="px-2 py-2">
                  <button
                    className="btn-secondary px-3 py-1 text-xs"
                    onClick={() => removeBar(bar.id)}
                    disabled={loading}
                  >
                    Remove
                  </button>
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
