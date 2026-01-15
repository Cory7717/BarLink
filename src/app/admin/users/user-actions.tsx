"use client";

import { useState } from "react";

export default function UserActions({ userId }: { userId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const disable = async (disabled: boolean) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, disabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage(disabled ? "User disabled." : "User enabled.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 text-xs text-slate-200">
      <button onClick={() => disable(true)} disabled={loading} className="btn-secondary px-2 py-1 text-xs">
        {loading ? "Saving..." : "Disable"}
      </button>
      <button onClick={() => disable(false)} disabled={loading} className="btn-secondary px-2 py-1 text-xs">
        {loading ? "Saving..." : "Enable"}
      </button>
      {message && <span className="text-amber-200">{message}</span>}
    </div>
  );
}
