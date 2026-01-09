"use client";

import { useEffect, useState } from "react";

type EventCategory = {
  id: string;
  name: string;
  displayName: string;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
};

const emptyForm = {
  name: "",
  displayName: "",
  icon: "",
  sortOrder: "0",
  isActive: true,
};

export default function AdminEventCategoriesPage() {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/event-categories");
    const data = await res.json();
    setCategories(data.categories || []);
  };

  useEffect(() => {
    load();
  }, []);

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/event-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          displayName: form.displayName,
          icon: form.icon || undefined,
          sortOrder: Number(form.sortOrder),
          isActive: form.isActive,
        }),
      });
      if (res.ok) {
        setForm(emptyForm);
        await load();
      }
    } finally {
      setLoading(false);
    }
  };

  const updateLocal = (id: string, field: keyof EventCategory, value: string | number | boolean | null) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, [field]: value } : cat))
    );
  };

  const saveCategory = async (category: EventCategory) => {
    setSavingId(category.id);
    try {
      const res = await fetch("/api/admin/event-categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: category.id,
          name: category.name,
          displayName: category.displayName,
          icon: category.icon || "",
          sortOrder: category.sortOrder,
          isActive: category.isActive,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.category) {
          setCategories((prev) =>
            prev.map((item) => (item.id === data.category.id ? data.category : item))
          );
        }
      } else {
        await load();
      }
    } finally {
      setSavingId(null);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    setSavingId(id);
    try {
      await fetch(`/api/admin/event-categories?id=${id}`, { method: "DELETE" });
      await load();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-3xl p-4">
        <h2 className="mb-2 text-xl font-semibold text-gradient">Create event category</h2>
        <p className="text-sm text-slate-300 mb-4">
          The Name is used for search and filtering (example: poker-night). Display Name is what users see.
        </p>
        <form onSubmit={createCategory} className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400"
            placeholder="Name (poker-night)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400"
            placeholder="Display name (Poker Night)"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            required
          />
          <input
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400"
            placeholder="Icon (optional)"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400"
              placeholder="Sort order"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active
            </label>
          </div>
          <button disabled={loading} className="btn-primary px-4 py-2 text-sm">
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      <div className="glass-panel rounded-3xl p-4">
        <h2 className="mb-3 text-xl font-semibold text-gradient">Event categories</h2>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="grid gap-3 md:grid-cols-[1.2fr,1.4fr,0.8fr,0.6fr,0.6fr]">
                <input
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                  value={category.name}
                  onChange={(e) => updateLocal(category.id, "name", e.target.value)}
                />
                <input
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                  value={category.displayName}
                  onChange={(e) => updateLocal(category.id, "displayName", e.target.value)}
                />
                <input
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                  value={category.icon || ""}
                  onChange={(e) => updateLocal(category.id, "icon", e.target.value)}
                />
                <input
                  type="number"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                  value={category.sortOrder}
                  onChange={(e) => updateLocal(category.id, "sortOrder", Number(e.target.value))}
                />
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={category.isActive}
                    onChange={(e) => updateLocal(category.id, "isActive", e.target.checked)}
                  />
                  Active
                </label>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => saveCategory(category)}
                  className="btn-primary px-4 py-1.5 text-xs"
                  disabled={savingId === category.id}
                >
                  {savingId === category.id ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="rounded-full border border-red-500/40 px-4 py-1.5 text-xs text-red-200 hover:bg-red-500/10"
                  disabled={savingId === category.id}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-slate-300">No categories yet. Create your first above.</p>
          )}
        </div>
      </div>
    </section>
  );
}
