"use client";

import { useState } from "react";

type OwnerSupportActionsProps = {
  ownerId: string;
  ownerEmail: string;
  allowFreeListings: boolean;
};

export default function OwnerSupportActions({
  ownerId,
  ownerEmail,
  allowFreeListings,
}: OwnerSupportActionsProps) {
  const [allowFree, setAllowFree] = useState(allowFreeListings);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const toggleFreeListings = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/owners/toggle-free-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId, allow: !allowFree }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update");
      }
      setAllowFree((prev) => !prev);
      setStatus("Free listings updated.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const sendResetLink = async () => {
    setResetting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset link");
      }
      setStatus("Password reset link sent.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">Support actions</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary px-4 py-2 text-xs"
          onClick={toggleFreeListings}
          disabled={saving}
        >
          {allowFree ? "Disable free listings" : "Enable free listings"}
        </button>
        <button
          type="button"
          className="btn-secondary px-4 py-2 text-xs"
          onClick={sendResetLink}
          disabled={resetting}
        >
          {resetting ? "Sending reset..." : "Send reset link"}
        </button>
        <a className="btn-secondary px-4 py-2 text-xs" href={`mailto:${ownerEmail}`}>
          Email owner
        </a>
      </div>
      {status && <p className="mt-2 text-xs text-slate-300">{status}</p>}
    </div>
  );
}
