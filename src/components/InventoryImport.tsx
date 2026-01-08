"use client";

import { useState } from "react";

interface InventoryImportProps {
  barId: string;
  onImportComplete: () => void;
}

export default function InventoryImport({ barId, onImportComplete }: InventoryImportProps) {
  const [importing, setImporting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const downloadTemplate = () => {
    const csv = `name,category,bottleSizeMl,startingQtyBottles,costPerBottle
Grey Goose Vodka,Vodka,750,12,35.99
Jack Daniels,Whiskey,750,8,28.50
Patron Silver,Tequila,750,6,45.00
Bacardi Rum,Rum,750,10,22.99`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      const items = lines.slice(1).map(line => {
        const values = line.split(',');
        return {
          name: values[0]?.trim() || '',
          category: values[1]?.trim() || 'Other',
          bottleSizeMl: parseInt(values[2]?.trim() || '750'),
          startingQtyBottles: parseInt(values[3]?.trim() || '0'),
          costPerBottle: parseFloat(values[4]?.trim() || '0'),
        };
      }).filter(item => item.name);

      const response = await fetch('/api/inventory/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barId,
          fileName: file.name,
          items,
        }),
      });

      if (!response.ok) throw new Error('Import failed');

      alert(`Successfully imported ${items.length} items!`);
      onImportComplete();
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import inventory. Please check your CSV format.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Import Inventory</h3>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-xs text-emerald-300 hover:text-emerald-200"
        >
          {showInstructions ? 'Hide' : 'Show'} instructions
        </button>
      </div>

      {showInstructions && (
        <div className="mb-4 rounded-lg bg-slate-800/60 p-4 text-sm text-slate-300 space-y-2">
          <p>1. Download the template CSV file</p>
          <p>2. Fill in your bottles with: name, category, size (ml), quantity, cost</p>
          <p>3. Upload the completed CSV file</p>
          <p className="text-xs text-slate-400">Supported categories: Vodka, Whiskey, Tequila, Rum, Gin, Wine, Beer, Other</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={downloadTemplate}
          className="w-full rounded-lg border border-cyan-400/30 bg-cyan-500/15 px-4 py-3 text-sm font-semibold text-cyan-50 hover:bg-cyan-500/25 transition-all"
        >
          📥 Download CSV Template
        </button>

        <label className="block">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={importing}
            className="hidden"
          />
          <div className="cursor-pointer w-full rounded-lg bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-center text-sm font-semibold text-slate-950 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50">
            {importing ? 'Importing...' : '📤 Upload Filled CSV'}
          </div>
        </label>
      </div>
    </div>
  );
}
