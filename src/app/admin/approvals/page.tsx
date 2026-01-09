"use client";

import { useEffect, useState } from "react";

type RequestItem = {
  id: string;
  category: string;
  createdAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  bar: { id: string; name: string; city: string; state: string };
  owner: { id: string; name: string; email: string };
};

export default function AdminApprovalsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/category-requests?status=PENDING");
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (request: RequestItem) => {
    setSavingId(request.id);
    setNote(null);
    try {
      const res = await fetch("/api/admin/category-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: request.id,
          action: "approve",
          displayName: request.category,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setNote(data.error || "Failed to approve request.");
      } else {
        await load();
      }
    } finally {
      setSavingId(null);
    }
  };

  const reject = async (request: RequestItem) => {
    setSavingId(request.id);
    setNote(null);
    try {
      const res = await fetch("/api/admin/category-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: request.id,
          action: "reject",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setNote(data.error || "Failed to reject request.");
      } else {
        await load();
      }
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-3xl p-4">
        <h2 className="mb-2 text-xl font-semibold text-gradient">Category approvals</h2>
        <p className="text-sm text-slate-300">
          Review incoming category requests from bar owners and approve them into Explore.
        </p>
      </div>

      {note && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {note}
        </div>
      )}

      <div className="glass-panel rounded-3xl p-4">
        {loading ? (
          <p className="text-sm text-slate-300">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-slate-300">No pending requests.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{request.category}</p>
                    <p className="text-xs text-slate-300">
                      {request.bar.name} — {request.bar.city}, {request.bar.state}
                    </p>
                    <p className="text-xs text-slate-400">
                      Requested by {request.owner.name} ({request.owner.email})
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => approve(request)}
                      className="btn-primary px-4 py-1.5 text-xs"
                      disabled={savingId === request.id}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(request)}
                      className="rounded-full border border-red-500/40 px-4 py-1.5 text-xs text-red-200 hover:bg-red-500/10"
                      disabled={savingId === request.id}
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Request ID: {request.id}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
