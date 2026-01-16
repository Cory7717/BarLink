'use client';

import { useState } from "react";
import { initOneSignal } from "@/lib/onesignalClient";

export default function PushOptIn({ userEmail }: { userEmail?: string | null }) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const optIn = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await initOneSignal(userEmail || undefined);
      setStatus(res.ok ? "Push prompt sent. Allow notifications in your browser." : res.message);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to enable push");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button onClick={optIn} disabled={loading} className="btn-secondary px-4 py-2 text-sm">
        {loading ? "Enabling..." : "Enable push reminders"}
      </button>
      {status && <p className="text-xs text-slate-300">{status}</p>}
    </div>
  );
}
