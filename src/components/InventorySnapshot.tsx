"use client";

import { useState, useEffect } from "react";
import BottlePhotoUpload from "./BottlePhotoUpload";

interface InventorySnapshotProps {
  barId: string;
  onComplete: () => void;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string | null;
  bottleSizeMl: number;
}

interface SnapshotItemData {
  inventoryItemId: string;
  quantityOnHand: number;
  notes?: string;
  imageUrl?: string;
  estimatedPct?: number;
  estimatedMl?: number;
}

export default function InventorySnapshot({ barId, onComplete }: InventorySnapshotProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [snapshotData, setSnapshotData] = useState<Record<string, SnapshotItemData>>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activePhotoItem, setActivePhotoItem] = useState<string | null>(null);

  useEffect(() => {
    fetchInventoryItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barId]);

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch(`/api/inventory/items?barId=${barId}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId: string, quantityOnHand: number) => {
    setSnapshotData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        inventoryItemId: itemId,
        quantityOnHand,
      },
    }));
  };

  const handlePhotoUpload = (itemId: string, imageUrl: string) => {
    setSnapshotData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        inventoryItemId: itemId,
        imageUrl,
      },
    }));
  };

  const handleEstimate = (itemId: string, estimatedPct: number, estimatedMl: number) => {
    setSnapshotData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        inventoryItemId: itemId,
        estimatedPct,
        estimatedMl,
      },
    }));
  };

  const updateEstimate = (itemId: string, pct: number) => {
    const bottleSize = items.find(i => i.id === itemId)?.bottleSizeMl || 750;
    const ml = Math.round((pct / 100) * bottleSize);
    setSnapshotData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        inventoryItemId: itemId,
        estimatedPct: pct,
        estimatedMl: ml,
      },
    }));
  };

  const applyEstimate = (itemId: string) => {
    const bottleSize = items.find(i => i.id === itemId)?.bottleSizeMl || 750;
    const estimate = snapshotData[itemId];
    if (!estimate?.estimatedMl) return;
    const qty = estimate.estimatedMl / bottleSize;
    setSnapshotData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        inventoryItemId: itemId,
        quantityOnHand: Number(qty.toFixed(2)),
      },
    }));
  };

  const handleSubmit = async () => {
    const snapshotItems = Object.values(snapshotData).filter(item => item.quantityOnHand > 0);

    if (snapshotItems.length === 0) {
      alert('Please record quantities for at least one item.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/inventory/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barId,
          snapshotDate: new Date().toISOString(),
          notes,
          items: snapshotItems,
        }),
      });

      if (!response.ok) throw new Error('Failed to record snapshot');

      alert('Inventory snapshot recorded successfully!');
      setSnapshotData({});
      setNotes('');
      onComplete();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to record snapshot. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading inventory...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
        <p className="text-amber-100">No inventory items found. Please import your inventory first.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Physical Inventory Snapshot</h3>
      <p className="text-sm text-slate-300 mb-4">Count bottles or take photos for AI estimation</p>
      
      <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
        {items.map(item => (
          <div key={item.id} className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <p className="text-xs text-slate-400">{item.category} • {item.bottleSizeMl}ml</p>
              </div>
              <button
                onClick={() => setActivePhotoItem(activePhotoItem === item.id ? null : item.id)}
                className="rounded-md border border-purple-400/30 bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-50 hover:bg-purple-500/25"
              >
                {activePhotoItem === item.id ? '✕ Close' : '📸 Photo'}
              </button>
            </div>

            {activePhotoItem === item.id && (
              <div className="mb-3">
                <BottlePhotoUpload
                  barId={barId}
                  onUploadSuccess={(url) => handlePhotoUpload(item.id, url)}
                  onEstimateComplete={(pct, ml) => handleEstimate(item.id, pct, ml)}
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <label className="flex-1">
                <span className="block text-xs text-slate-400 mb-1">Bottles on hand</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={snapshotData[item.id]?.quantityOnHand || ''}
                  onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                  className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </label>
            </div>

            {snapshotData[item.id]?.estimatedPct !== undefined && (
              <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-100">
                <div className="flex items-center justify-between">
                  <span>Estimated fill: {snapshotData[item.id]?.estimatedPct?.toFixed(0)}%</span>
                  <span>~{snapshotData[item.id]?.estimatedMl} ml</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={snapshotData[item.id]?.estimatedPct || 0}
                  onChange={(e) => updateEstimate(item.id, Number(e.target.value))}
                  className="mt-2 w-full accent-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => applyEstimate(item.id)}
                  className="mt-2 btn-secondary px-3 py-1 text-xs"
                >
                  Use estimate
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-white mb-2">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Snapshot notes, observations, etc."
          className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-lg bg-linear-to-r from-purple-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white hover:from-purple-400 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
      >
        {submitting ? 'Saving...' : 'Save Snapshot'}
      </button>
    </div>
  );
}
