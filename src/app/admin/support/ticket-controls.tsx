"use client";

import { useState } from "react";

export default function TicketStatusControls({
  ticketId,
  currentStatus,
  currentPriority,
  currentResolution,
}: {
  ticketId: string;
  currentStatus: string;
  currentPriority: string;
  currentResolution?: string | null;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [priority, setPriority] = useState(currentPriority);
  const [resolution, setResolution] = useState(currentResolution || "");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/support/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, priority, resolution }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage("Updated");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 text-xs text-slate-200">
      <div className="flex gap-1">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
        >
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
          <option value="PENDING">Pending</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
        >
          <option value="LOW">Low</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">High</option>
        </select>
        <button onClick={update} disabled={loading} className="btn-secondary px-2 py-1 text-xs">
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
      <textarea
        value={resolution}
        onChange={(e) => setResolution(e.target.value)}
        placeholder="Resolution/notes"
        className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
        rows={2}
      />
      {message && <span className="text-amber-200">{message}</span>}
    </div>
  );
}
