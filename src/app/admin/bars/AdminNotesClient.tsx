"use client";

import { useEffect, useState } from "react";

type Note = {
  id: string;
  adminEmail: string;
  content: string;
  createdAt: string;
};

export default function AdminNotesClient({ barId }: { barId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bars/${barId}/notes`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load notes");
      setNotes(data.notes || []);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barId]);

  const addNote = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/bars/${barId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add note");
      setContent("");
      fetchNotes();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add internal note"
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        />
        <button onClick={addNote} disabled={loading} className="btn-primary px-3 py-2 text-sm">
          {loading ? "Saving..." : "Add"}
        </button>
      </div>
      {message && <p className="text-xs text-amber-200">{message}</p>}
      <div className="space-y-2">
        {notes.map((n) => (
          <div key={n.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{n.adminEmail}</span>
              <span>{new Date(n.createdAt).toLocaleString()}</span>
            </div>
            <div className="text-white">{n.content}</div>
          </div>
        ))}
        {notes.length === 0 && <p className="text-sm text-slate-400">No notes yet.</p>}
      </div>
    </div>
  );
}
