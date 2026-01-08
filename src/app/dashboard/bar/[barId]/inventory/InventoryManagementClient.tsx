"use client";

import { useState } from "react";
import InventoryImport from "@/components/InventoryImport";
import ShiftUsageRecorder from "@/components/ShiftUsageRecorder";
import InventorySnapshot from "@/components/InventorySnapshot";
import VarianceAlerts from "@/components/VarianceAlerts";
import PDFExport from "@/components/PDFExport";

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
  const [activeTab, setActiveTab] = useState<'items' | 'import' | 'shift' | 'snapshot' | 'alerts' | 'export'>('items');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
    // Optionally refetch items
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
      console.error('Failed to fetch items:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'items':
        return (
          <div className="rounded-xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Inventory Items ({items.length})</h2>
            {items.length === 0 ? (
              <p className="text-center text-slate-400 py-8">
                No inventory items yet. Use the Import tab to add your liquor bottles.
              </p>
            ) : (
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-900/50 p-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                      <div className="flex gap-3 text-xs text-slate-400 mt-1">
                        <span>{item.category || 'Other'}</span>
                        <span>•</span>
                        <span>{item.bottleSizeMl}ml</span>
                        <span>•</span>
                        <span>{item.startingQtyBottles} bottles</span>
                        {item.costPerBottle && (
                          <>
                            <span>•</span>
                            <span>${item.costPerBottle.toFixed(2)}/bottle</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'import':
        return <InventoryImport barId={barId} onImportComplete={handleDataChange} />;

      case 'shift':
        return <ShiftUsageRecorder barId={barId} onComplete={handleDataChange} />;

      case 'snapshot':
        return <InventorySnapshot barId={barId} onComplete={handleDataChange} />;

      case 'alerts':
        return <VarianceAlerts barId={barId} key={refreshKey} />;

      case 'export':
        return <PDFExport barId={barId} barSlug={barSlug} />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('items')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'items'
              ? 'bg-linear-to-r from-emerald-500 to-emerald-600 text-slate-950'
              : 'border border-slate-700 bg-slate-800/40 text-white hover:bg-slate-700'
          }`}
        >
          📦 Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'import'
              ? 'bg-linear-to-r from-cyan-500 to-cyan-600 text-slate-950'
              : 'border border-slate-700 bg-slate-800/40 text-white hover:bg-slate-700'
          }`}
        >
          📥 Import
        </button>
        <button
          onClick={() => setActiveTab('shift')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'shift'
              ? 'bg-linear-to-r from-amber-500 to-amber-600 text-slate-950'
              : 'border border-slate-700 bg-slate-800/40 text-white hover:bg-slate-700'
          }`}
        >
          📝 Shift Usage
        </button>
        <button
          onClick={() => setActiveTab('snapshot')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'snapshot'
              ? 'bg-linear-to-r from-purple-500 to-purple-600 text-white'
              : 'border border-slate-700 bg-slate-800/40 text-white hover:bg-slate-700'
          }`}
        >
          📸 Snapshot
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'alerts'
              ? 'bg-linear-to-r from-red-500 to-red-600 text-white'
              : 'border border-slate-700 bg-slate-800/40 text-white hover:bg-slate-700'
          }`}
        >
          ⚠️ Alerts
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'export'
              ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white'
              : 'border border-slate-700 bg-slate-800/40 text-white hover:bg-slate-700'
          }`}
        >
          📄 Export PDF
        </button>
      </div>

      {/* Tab Content */}
      {renderContent()}
    </div>
  );
}
