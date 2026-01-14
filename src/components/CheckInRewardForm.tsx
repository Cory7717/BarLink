'use client';

import { useState } from "react";

export default function CheckInRewardForm({ barId, initialReward }: { barId: string; initialReward: string | null }) {
  const [reward, setReward] = useState(initialReward || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/bars/${barId}/checkin-reward`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reward: reward.trim() || null }),
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
      <label className="block text-sm text-slate-200">
        Check-in perk (shown to patrons after QR check-in)
        <input
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          placeholder="e.g., 10% off when you check in via QR"
        />
      </label>
      <button type="submit" className="btn-primary px-4 py-2 text-sm" disabled={saving}>
        {saving ? "Saving..." : "Save perk"}
      </button>
      {status && <p className="text-xs text-slate-300">{status}</p>}
    </form>
  );
}
