"use client";

import { useEffect, useMemo, useState } from "react";
import InventoryImport from "@/components/InventoryImport";
import ShiftUsageRecorder from "@/components/ShiftUsageRecorder";
import InventorySnapshot from "@/components/InventorySnapshot";
import VarianceAlerts from "@/components/VarianceAlerts";
import PDFExport from "@/components/PDFExport";
import BottlePhotoUpload from "@/components/BottlePhotoUpload";

interface InventoryItem {
  id: string;
  name: string;
  category: string | null;
  bottleSizeMl: number;
  startingQtyBottles: number;
  costPerBottle: number | null;
  isActive: boolean;
}

interface InventoryManagementClientProps {
  barId: string;
  barSlug: string;
  initialItems: InventoryItem[];
}

export default function InventoryManagementClient({ barId, barSlug, initialItems }: InventoryManagementClientProps) {
  const [items, setItems] = useState(initialItems);
  const [activeTab, setActiveTab] = useState<"items" | "import" | "shift" | "snapshot" | "alerts" | "export" | "photo">("items");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState(initialItems[0]?.id || "");
  const [lastEstimate, setLastEstimate] = useState<{ pct: number; ml: number } | null>(null);
  const [parMap, setParMap] = useState<Record<string, number>>({});

  const parStorageKey = `bar-${barId}-par-levels`;

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(parStorageKey) : null;
    if (stored) {
      try {
        setParMap(JSON.parse(stored));
      } catch (e) {
        console.warn("Failed to parse par levels", e);
      }
    }
  }, [parStorageKey]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(parStorageKey, JSON.stringify(parMap));
    }
  }, [parMap, parStorageKey]);

  const selectedItem = useMemo(() => items.find((i) => i.id === selectedItemId), [items, selectedItemId]);

  const handleDataChange = () => {
    setRefreshKey((prev) => prev + 1);
    fetchItems();
  };

  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/inventory/items?barId=${barId}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "items":
        return (
          <div className="glass-panel rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-2">Inventory items ({items.length})</h2>
            <p className="text-sm text-slate-300 mb-4">
              On-hand is your current bottle count. Par level is your target. Order is a suggestion to reach par. Value uses cost/bottle.
            </p>
            <div className="text-sm text-slate-200 mb-3">
              Total value on hand:{" "}
              <span className="font-semibold text-white">
                $
                {items
                  .reduce((sum, item) => sum + (item.startingQtyBottles || 0) * (item.costPerBottle || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
            {items.length === 0 ? (
              <p className="text-center text-slate-400 py-8">
                No inventory items yet. Use the Import tab to add your liquor bottles.
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex-1 space-y-1">
                      <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-300 mt-1">
                        <span>{item.category || "Other"}</span>
                        <span>•</span>
                        <span>{item.bottleSizeMl}ml</span>
                        <span>•</span>
                        <span>{item.startingQtyBottles} on hand</span>
                        {item.costPerBottle && (
                          <>
                            <span>•</span>
                            <span>${item.costPerBottle.toFixed(2)}/bottle</span>
                            <span>•</span>
                            <span>Value: ${(item.startingQtyBottles * item.costPerBottle).toFixed(2)}</span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-slate-200 items-center">
                        <label className="flex items-center gap-2">
                          <span className="text-xs text-slate-300">Par</span>
                          <input
                            type="number"
                            min={0}
                            value={parMap[item.id] ?? 12}
                            onChange={(e) => setParMap((prev) => ({ ...prev, [item.id]: Number(e.target.value) || 0 }))}
                            className="w-20 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
                          />
                        </label>
                        <span className="text-xs text-slate-300">
                          Order:{" "}
                          <span className="text-white font-semibold">
                            {Math.max((parMap[item.id] ?? 12) - (item.startingQtyBottles || 0), 0)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "import":
        return <InventoryImport barId={barId} onImportComplete={handleDataChange} />;

      case "shift":
        return <ShiftUsageRecorder barId={barId} onComplete={handleDataChange} />;

      case "snapshot":
        return <InventorySnapshot barId={barId} onComplete={handleDataChange} />;

      case "alerts":
        return <VarianceAlerts barId={barId} key={refreshKey} />;

      case "photo":
        return (
          <div className="glass-panel rounded-3xl p-4 sm:p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Photo estimator</h2>
                <p className="text-sm text-slate-300">Snap a bottle photo to estimate remaining volume.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-300">Select bottle</label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                aria-label="Select bottle for photo estimation"
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.bottleSizeMl}ml)
                  </option>
                ))}
              </select>
            </div>

            <BottlePhotoUpload
              barId={barId}
              bottleSizeMl={selectedItem?.bottleSizeMl || 750}
              onUploadSuccess={() => {}}
              onEstimateComplete={(pct, ml) => setLastEstimate({ pct, ml })}
            />

            {lastEstimate && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-100 text-sm">
                Estimated remaining for {selectedItem?.name || "bottle"}: <strong>{lastEstimate.pct.toFixed(1)}%</strong> (~{lastEstimate.ml} ml)
              </div>
            )}
          </div>
        );

      case "export":
        return <PDFExport barId={barId} barSlug={barSlug} />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => setActiveTab("items")}
          className={activeTab === "items" ? "btn-primary px-4 py-3 text-sm" : "btn-secondary px-4 py-3 text-sm"}
        >
          Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("import")}
          className={activeTab === "import" ? "btn-primary px-4 py-3 text-sm" : "btn-secondary px-4 py-3 text-sm"}
        >
          Import
        </button>
        <button
          onClick={() => setActiveTab("shift")}
          className={activeTab === "shift" ? "btn-primary px-4 py-3 text-sm" : "btn-secondary px-4 py-3 text-sm"}
        >
          Shift usage
        </button>
        <button
          onClick={() => setActiveTab("snapshot")}
          className={activeTab === "snapshot" ? "btn-primary px-4 py-3 text-sm" : "btn-secondary px-4 py-3 text-sm"}
        >
          Snapshot
        </button>
        <button
          onClick={() => setActiveTab("photo")}
          className={activeTab === "photo" ? "btn-primary px-4 py-3 text-sm" : "btn-secondary px-4 py-3 text-sm"}
        >
          Photo estimate
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={activeTab === "alerts" ? "btn-primary px-4 py-3 text-sm" : "btn-secondary px-4 py-3 text-sm"}
        >
          Alerts
        </button>
        <button
          onClick={() => setActiveTab("export")}
          className={activeTab === "export" ? "btn-primary px-4 py-3 text-sm" : "btn-secondary px-4 py-3 text-sm"}
        >
          Export PDF
        </button>
      </div>

      {renderContent()}
    </div>
  );
}
