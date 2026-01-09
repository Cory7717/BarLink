"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { DAYS_OF_WEEK } from "@/lib/constants";

type DrinkSpecial = {
  id: string;
  name: string;
  description: string | null;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  active: boolean;
};

type FoodOffering = {
  id: string;
  name: string;
  description: string | null;
  specialDays: number[];
  isSpecial: boolean;
  active: boolean;
};

type StaticOffering = {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  position: number;
};

type BarData = {
  id: string;
  name: string;
  drinkSpecials: DrinkSpecial[];
  foodOfferings: FoodOffering[];
  staticOfferings: StaticOffering[];
};

type OfferingType = "drink" | "food" | "static";

export default function OfferingsClient({ bar }: { bar: BarData }) {
  const [activeTab, setActiveTab] = useState<OfferingType>("drink");
  const [drinkSpecials, setDrinkSpecials] = useState<DrinkSpecial[]>(bar.drinkSpecials);
  const [foodOfferings, setFoodOfferings] = useState<FoodOffering[]>(bar.foodOfferings);
  const [staticOfferings, setStaticOfferings] = useState<StaticOffering[]>(bar.staticOfferings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<(DrinkSpecial | FoodOffering | StaticOffering) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    daysOfWeek: [] as number[],
    specialDays: [] as number[],
    icon: "",
    position: 0,
    active: true,
    isSpecial: false,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      startTime: "",
      endTime: "",
      daysOfWeek: [],
      specialDays: [],
      icon: "",
      position: 0,
      active: true,
      isSpecial: false,
    });
    setEditingItem(null);
    setError(null);
  };

  const openModal = (type: OfferingType, item?: DrinkSpecial | FoodOffering | StaticOffering) => {
    setActiveTab(type);
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || "",
        description: item.description || "",
        startTime: "startTime" in item ? item.startTime : "",
        endTime: "endTime" in item ? item.endTime : "",
        daysOfWeek: "daysOfWeek" in item ? item.daysOfWeek : [],
        specialDays: "specialDays" in item ? item.specialDays : [],
        icon: "icon" in item ? item.icon : "",
        position: "position" in item ? item.position : 0,
        active: "active" in item ? item.active : true,
        isSpecial: "isSpecial" in item ? item.isSpecial : false,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const toggleDay = (day: number, field: "daysOfWeek" | "specialDays") => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(day) ? prev[field].filter((d) => d !== day) : [...prev[field], day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let endpoint = "";
      let body: Record<string, unknown> = {};

      if (activeTab === "drink") {
        endpoint = editingItem
          ? `/api/bars/${bar.id}/offerings/drink-specials/${editingItem.id}`
          : `/api/bars/${bar.id}/offerings/drink-specials`;
        body = {
          name: formData.name,
          description: formData.description || null,
          startTime: formData.startTime,
          endTime: formData.endTime,
          daysOfWeek: formData.daysOfWeek,
          active: formData.active,
        };
      } else if (activeTab === "food") {
        endpoint = editingItem
          ? `/api/bars/${bar.id}/offerings/food/${editingItem.id}`
          : `/api/bars/${bar.id}/offerings/food`;
        body = {
          name: formData.name,
          description: formData.description || null,
          specialDays: formData.specialDays,
          isSpecial: formData.isSpecial,
          active: formData.active,
        };
      } else if (activeTab === "static") {
        endpoint = editingItem
          ? `/api/bars/${bar.id}/offerings/static/${editingItem.id}`
          : `/api/bars/${bar.id}/offerings/static`;
        body = {
          name: formData.name,
          icon: formData.icon,
          description: formData.description || null,
          position: formData.position,
        };
      }

      const response = await fetch(endpoint, {
        method: editingItem ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save");
      }

      if (activeTab === "drink") {
        if (editingItem) {
          setDrinkSpecials((prev) => prev.map((item) => (item.id === result.id ? result : item)));
        } else {
          setDrinkSpecials((prev) => [...prev, result]);
        }
      } else if (activeTab === "food") {
        if (editingItem) {
          setFoodOfferings((prev) => prev.map((item) => (item.id === result.id ? result : item)));
        } else {
          setFoodOfferings((prev) => [...prev, result]);
        }
      } else if (activeTab === "static") {
        if (editingItem) {
          setStaticOfferings((prev) => prev.map((item) => (item.id === result.id ? result : item)));
        } else {
          setStaticOfferings((prev) => [...prev, result]);
        }
      }

      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: OfferingType, id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setLoading(true);
    try {
      let endpoint = "";
      if (type === "drink") {
        endpoint = `/api/bars/${bar.id}/offerings/drink-specials/${id}`;
      } else if (type === "food") {
        endpoint = `/api/bars/${bar.id}/offerings/food/${id}`;
      } else if (type === "static") {
        endpoint = `/api/bars/${bar.id}/offerings/static/${id}`;
      }

      const response = await fetch(endpoint, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      if (type === "drink") {
        setDrinkSpecials((prev) => prev.filter((item) => item.id !== id));
      } else if (type === "food") {
        setFoodOfferings((prev) => prev.filter((item) => item.id !== id));
      } else if (type === "static") {
        setStaticOfferings((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      alert("Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gradient">Offerings and specials</h1>
            <p className="text-slate-300 mt-2">{bar.name}</p>
          </div>
          <Link href={`/dashboard/bar/${bar.id}`} className="btn-secondary px-4 py-2 text-sm">
            Back
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab("drink")}
            className={activeTab === "drink" ? "btn-primary px-4 py-2 text-sm" : "btn-secondary px-4 py-2 text-sm"}
          >
            Drink specials ({drinkSpecials.length})
          </button>
          <button
            onClick={() => setActiveTab("food")}
            className={activeTab === "food" ? "btn-primary px-4 py-2 text-sm" : "btn-secondary px-4 py-2 text-sm"}
          >
            Food offerings ({foodOfferings.length})
          </button>
          <button
            onClick={() => setActiveTab("static")}
            className={activeTab === "static" ? "btn-primary px-4 py-2 text-sm" : "btn-secondary px-4 py-2 text-sm"}
          >
            Static offerings ({staticOfferings.length}/3)
          </button>
        </div>

        <button
          onClick={() => openModal(activeTab)}
          disabled={activeTab === "static" && staticOfferings.length >= 3}
          className="mb-6 btn-primary px-6 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add {activeTab === "drink" ? "drink special" : activeTab === "food" ? "food item" : "static offering"}
        </button>

        <div className="glass-panel rounded-3xl p-6 shadow-lg">
          {activeTab === "drink" && (
            <div className="space-y-4">
              {drinkSpecials.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No drink specials yet. Add your first one!</p>
              ) : (
                drinkSpecials.map((special) => (
                  <div key={special.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{special.name}</h3>
                        {special.description && <p className="text-sm text-slate-400 mt-1">{special.description}</p>}
                        <p className="text-sm text-cyan-200 mt-2">
                          {special.startTime} - {special.endTime}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {special.daysOfWeek.length === 0
                            ? "Daily"
                            : special.daysOfWeek
                                .sort()
                                .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label.slice(0, 3))
                                .join(", ")}
                        </p>
                        <span
                          className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                            special.active ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-600/40 text-slate-300"
                          }`}
                        >
                          {special.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openModal("drink", special)} className="btn-secondary px-3 py-1 text-xs">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete("drink", special.id)}
                          className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-200 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "food" && (
            <div className="space-y-4">
              {foodOfferings.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No food offerings yet. Add your first one!</p>
              ) : (
                foodOfferings.map((food) => (
                  <div key={food.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{food.name}</h3>
                        {food.description && <p className="text-sm text-slate-400 mt-1">{food.description}</p>}
                        <p className="text-xs text-slate-400 mt-2">
                          {food.specialDays.length === 0
                            ? food.isSpecial
                              ? "Special - all days"
                              : "Always available"
                            : `Special on: ${food.specialDays
                                .sort()
                                .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label.slice(0, 3))
                                .join(", ")}`}
                        </p>
                        <span
                          className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                            food.active ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-600/40 text-slate-300"
                          }`}
                        >
                          {food.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openModal("food", food)} className="btn-secondary px-3 py-1 text-xs">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete("food", food.id)}
                          className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-200 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "static" && (
            <div className="space-y-4">
              {staticOfferings.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  No static offerings yet. Add amenities like pool tables or darts. (Max 3)
                </p>
              ) : (
                staticOfferings.map((offering) => (
                  <div key={offering.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{offering.icon}</span>
                          <h3 className="text-lg font-semibold text-white">{offering.name}</h3>
                        </div>
                        {offering.description && <p className="text-sm text-slate-400 mt-1 ml-10">{offering.description}</p>}
                        <p className="text-xs text-slate-400 mt-2 ml-10">Position: {offering.position}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openModal("static", offering)} className="btn-secondary px-3 py-1 text-xs">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete("static", offering.id)}
                          className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-200 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-white mb-4">
              {editingItem ? "Edit" : "Add"}{" "}
              {activeTab === "drink" ? "drink special" : activeTab === "food" ? "food offering" : "static offering"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-3 text-red-100 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="offering-name" className="block text-sm text-slate-300 mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="offering-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="offering-description" className="block text-sm text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  id="offering-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                  rows={3}
                />
              </div>

              {activeTab === "drink" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="start-time" className="block text-sm text-slate-300 mb-2">
                        Start time <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="start-time"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="end-time" className="block text-sm text-slate-300 mb-2">
                        End time <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="end-time"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Days (leave empty for daily)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value, "daysOfWeek")}
                          className={
                            formData.daysOfWeek.includes(day.value)
                              ? "btn-primary px-3 py-2 text-xs"
                              : "btn-secondary px-3 py-2 text-xs"
                          }
                        >
                          {day.label.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="rounded"
                      />
                      Active
                    </label>
                  </div>
                </>
              )}

              {activeTab === "food" && (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.isSpecial}
                        onChange={(e) => setFormData({ ...formData, isSpecial: e.target.checked })}
                        className="rounded"
                      />
                      This is a special or limited item
                    </label>
                  </div>

                  {formData.isSpecial && (
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">
                        Special on these days (leave empty for all days)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleDay(day.value, "specialDays")}
                            className={
                              formData.specialDays.includes(day.value)
                                ? "btn-primary px-3 py-2 text-xs"
                                : "btn-secondary px-3 py-2 text-xs"
                            }
                          >
                            {day.label.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="rounded"
                      />
                      Active
                    </label>
                  </div>
                </>
              )}

              {activeTab === "static" && (
                <>
                  <div>
                    <label htmlFor="offering-icon" className="block text-sm text-slate-300 mb-2">
                      Icon (emoji) <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="offering-icon"
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                      placeholder="Icon"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="offering-position" className="block text-sm text-slate-300 mb-2">
                      Position (0-2)
                    </label>
                    <input
                      id="offering-position"
                      type="number"
                      min="0"
                      max="2"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value, 10) })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading} className="flex-1 btn-primary px-4 py-3 text-sm disabled:opacity-50">
                  {loading ? "Saving..." : editingItem ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="btn-secondary px-6 py-3 text-sm"
                >
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
