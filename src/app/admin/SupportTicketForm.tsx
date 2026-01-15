"use client";

import { useState } from "react";

export default function SupportTicketForm({ barId }: { barId?: string }) {
  const [userEmail, setUserEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const submit = async () => {
    if (!userEmail || !subject || !message) {
      setStatusMessage("Email, subject, and message are required.");
      return;
    }
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barId, userEmail, subject, message, priority }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create ticket");
      setStatusMessage("Ticket created.");
      setSubject("");
      setMessage("");
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 text-sm text-slate-200">
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-300 mb-1">User email</label>
          <input
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
            placeholder="user@example.com"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-300 mb-1">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
            placeholder="Issue summary"
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-300 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          >
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs text-slate-300 mb-1">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          rows={4}
        />
      </div>
      {statusMessage && <div className="text-xs text-amber-200">{statusMessage}</div>}
      <button onClick={submit} disabled={loading} className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
        {loading ? "Saving..." : "Create ticket"}
      </button>
    </div>
  );
}
