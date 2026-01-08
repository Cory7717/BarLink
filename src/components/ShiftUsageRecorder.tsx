"use client";

import { useState, useEffect } from "react";

interface ShiftUsageRecorderProps {
  barId: string;
  onComplete: () => void;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string | null;
  bottleSizeMl: number;
}

export default function ShiftUsageRecorder({ barId, onComplete }: ShiftUsageRecorderProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    const usageItems = Object.entries(usage)
      .filter(([, qty]) => qty > 0)
      .map(([inventoryItemId, quantityUsed]) => ({
        inventoryItemId,
        quantityUsed,
      }));

    if (usageItems.length === 0) {
      alert('Please record usage for at least one item.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/inventory/shift-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barId,
          shiftTime: new Date().toISOString(),
          notes,
          items: usageItems,
        }),
      });

      if (!response.ok) throw new Error('Failed to record shift usage');

      alert('Shift usage recorded successfully!');
      setUsage({});
      setNotes('');
      onComplete();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to record shift usage. Please try again.');
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
      <h3 className="text-lg font-semibold text-white mb-4">Record Shift Usage</h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-900/50 p-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{item.name}</p>
              <p className="text-xs text-slate-400">{item.category} • {item.bottleSizeMl}ml</p>
            </div>
            <input
              type="number"
              min="0"
              step="0.5"
              value={usage[item.id] || ''}
              onChange={(e) => setUsage({ ...usage, [item.id]: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              className="w-20 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-white mb-2">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Shift notes, discrepancies, etc."
          className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-lg bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
      >
        {submitting ? 'Recording...' : 'Record Shift Usage'}
      </button>
    </div>
  );
}
