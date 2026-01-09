"use client";

import { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { DAYS_OF_WEEK } from "@/lib/constants";
import { DEFAULT_ACTIVITY_CATEGORIES } from "@/lib/activityCategories";

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  startDate: string;
  endDate?: string | null;
  startTime: string;
  endTime?: string | null;
  isActive: boolean;
  isSpecial: boolean;
};

export type EventsClientProps = {
  bar: {
    id: string;
    name: string;
    events: EventItem[];
  };
};

type EventCategory = {
  name: string;
  displayName: string;
  icon?: string | null;
};

const FALLBACK_CATEGORIES: EventCategory[] = DEFAULT_ACTIVITY_CATEGORIES.map((category) => ({
  name: category.name,
  displayName: category.displayName,
}));

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function resolveCategoryName(value: string | null | undefined, options: EventCategory[]) {
  if (!value) return "";
  const normalized = value.toLowerCase().trim();
  const slug = toSlug(value);
  const match = options.find(
    (category) =>
      category.name === normalized ||
      category.name === slug ||
      category.displayName.toLowerCase() === normalized
  );
  return match?.name || "";
}

function resolveCategoryLabel(value: string | null | undefined, options: EventCategory[]) {
  if (!value) return "Event";
  const normalized = value.toLowerCase().trim();
  const slug = toSlug(value);
  const match = options.find(
    (category) =>
      category.name === normalized ||
      category.name === slug ||
      category.displayName.toLowerCase() === normalized
  );
  return match?.displayName || value;
}

function dayFromDate(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.getDay();
}

function formatLocalDate(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString();
}

function nextDateForDay(targetDay: number) {
  const now = new Date();
  const result = new Date(now);
  const currentDay = now.getDay();
  const delta = (targetDay - currentDay + 7) % 7;
  result.setDate(now.getDate() + (delta === 0 ? 7 : delta));
  return result.toISOString().slice(0, 10);
}

export default function EventsClient({ bar }: EventsClientProps) {
  const [events, setEvents] = useState<EventItem[]>(bar.events || []);
  const [activeDay, setActiveDay] = useState<number>(new Date().getDay());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [categoryStatus, setCategoryStatus] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: FALLBACK_CATEGORIES[0].name,
    customCategory: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    startTime: "19:00",
    endTime: "",
    isActive: true,
    isSpecial: false,
  });

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/event-categories");
        const data = await res.json();
        if (res.ok && isMounted) {
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const categoryOptions = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  const filteredEvents = useMemo(
    () => events.filter((e) => dayFromDate(e.startDate) === activeDay),
    [events, activeDay]
  );

  const openModal = (event?: EventItem) => {
    setError(null);
    if (event) {
      setEditing(event);
      const resolvedCategory = resolveCategoryName(event.category, categoryOptions);
      const isCustom = !resolvedCategory;
      setForm({
        title: event.title,
        description: event.description || "",
        category: isCustom ? "custom" : resolvedCategory,
        customCategory: isCustom ? event.category || "" : "",
        startDate: event.startDate.slice(0, 10),
        endDate: event.endDate ? event.endDate.slice(0, 10) : "",
        startTime: event.startTime,
        endTime: event.endTime || "",
        isActive: event.isActive,
        isSpecial: event.isSpecial,
      });
    } else {
      setEditing(null);
      setForm({
        title: "",
        description: "",
        category: categoryOptions[0]?.name || "custom",
        customCategory: "",
        startDate: nextDateForDay(activeDay),
        endDate: "",
        startTime: "19:00",
        endTime: "",
        isActive: true,
        isSpecial: false,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setError(null);
    setCategoryStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        category: form.category === "custom" ? form.customCategory || form.title : form.category,
        startDate: form.startDate,
        endDate: form.endDate || null,
        startTime: form.startTime,
        endTime: form.endTime || null,
        isActive: form.isActive,
        isSpecial: form.isSpecial,
      };

      const endpoint = editing ? `/api/bars/${bar.id}/events/${editing.id}` : `/api/bars/${bar.id}/events`;
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save event");
      }

      if (editing) {
        setEvents((prev) => prev.map((ev) => (ev.id === data.id ? data : ev)));
      } else {
        setEvents((prev) => [...prev, data]);
      }
      setActiveDay(dayFromDate((data.startDate as string) || form.startDate));
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/bars/${bar.id}/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setSaving(false);
    }
  };

  const requestCategory = async () => {
    const candidate = form.customCategory || form.title;
    if (!candidate.trim()) {
      setCategoryStatus("Add a custom category name before requesting.");
      return;
    }
    setCategoryStatus("Sending request...");
    try {
      const res = await fetch("/api/request-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barId: bar.id, category: candidate.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send request");
      }
      setCategoryStatus("Request sent to admin.");
    } catch (err) {
      setCategoryStatus(err instanceof Error ? err.message : "Failed to send request");
    }
  };

  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gradient">Events and promotions</h1>
            <p className="text-slate-300 mt-2">{bar.name}</p>
          </div>
          <Link href={`/dashboard/bar/${bar.id}`} className="btn-secondary px-4 py-2 text-sm">
            Back
          </Link>
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-lg space-y-6">
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.value}
                onClick={() => setActiveDay(day.value)}
                className={activeDay === day.value ? "btn-primary px-3 py-2 text-xs" : "btn-secondary px-3 py-2 text-xs"}
              >
                {day.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {DAYS_OF_WEEK.find((d) => d.value === activeDay)?.label} ({filteredEvents.length})
            </h2>
            <button onClick={() => openModal()} className="btn-primary px-4 py-2 text-sm">
              Add event
            </button>
          </div>

          {filteredEvents.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No events for this day yet.</p>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <div key={event.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                        <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-200">
                          {resolveCategoryLabel(event.category, categoryOptions)}
                        </span>
                        {event.isSpecial && (
                          <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-200">Special</span>
                        )}
                        {!event.isActive && (
                          <span className="text-xs px-2 py-1 rounded bg-slate-600/40 text-slate-200">Inactive</span>
                        )}
                      </div>
                      {event.description && <p className="text-sm text-slate-300">{event.description}</p>}
                      <p className="text-xs text-slate-400">
                        {formatLocalDate(event.startDate)} • {event.startTime}
                        {event.endTime ? ` - ${event.endTime}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openModal(event)} className="btn-secondary px-3 py-1 text-xs">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-200 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-white mb-4">{editing ? "Edit event" : "Add event"}</h2>
            {error && (
              <div className="mb-3 rounded-2xl border border-red-500/60 bg-red-500/10 text-red-100 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="event-title" className="block text-sm text-slate-300 mb-1">
                  Title *
                </label>
                <input
                  id="event-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="event-description" className="block text-sm text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  id="event-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event-category" className="block text-sm text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    id="event-category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.displayName}
                      </option>
                    ))}
                    <option value="custom">Custom</option>
                  </select>
                </div>
                {form.category === "custom" && (
                  <div>
                    <label htmlFor="event-custom" className="block text-sm text-slate-300 mb-1">
                      Custom category
                    </label>
                    <input
                      id="event-custom"
                      type="text"
                      value={form.customCategory}
                      onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                      placeholder="e.g., Poker Night"
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                      <button
                        type="button"
                        onClick={requestCategory}
                        className="btn-secondary px-3 py-1 text-xs"
                      >
                        Request new category
                      </button>
                      {categoryStatus && <span>{categoryStatus}</span>}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event-start-date" className="block text-sm text-slate-300 mb-1">
                    Start date *
                  </label>
                  <input
                    id="event-start-date"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="event-start-time" className="block text-sm text-slate-300 mb-1">
                    Start time *
                  </label>
                  <input
                    id="event-start-time"
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event-end-date" className="block text-sm text-slate-300 mb-1">
                    End date
                  </label>
                  <input
                    id="event-end-date"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="event-end-time" className="block text-sm text-slate-300 mb-1">
                    End time
                  </label>
                  <input
                    id="event-end-time"
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.isSpecial}
                    onChange={(e) => setForm({ ...form, isSpecial: e.target.checked })}
                  />
                  Mark as special event
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 btn-primary px-4 py-3 text-sm disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update event" : "Create event"}
                </button>
                <button type="button" onClick={closeModal} disabled={saving} className="btn-secondary px-6 py-3 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
