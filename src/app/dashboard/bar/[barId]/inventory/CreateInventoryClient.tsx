"use client";

import { useState } from "react";
import Link from "next/link";

type Row = {
  name: string;
  category: string;
  bottleSizeMl: string;
  startingQtyBottles: string;
  costPerBottle: string;
};

const defaultRows: Row[] = [
  { name: "Karaoke Night Shot Pour", category: "Vodka", bottleSizeMl: "750", startingQtyBottles: "12", costPerBottle: "28.50" },
  { name: "House Tequila", category: "Tequila", bottleSizeMl: "1000", startingQtyBottles: "8", costPerBottle: "32.00" },
];

export default function CreateInventoryClient({ barId }: { barId: string }) {
  const [rows, setRows] = useState<Row[]>(defaultRows);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadTemplate = () => {
    const csv = `name,category,bottleSizeMl,startingQtyBottles,costPerBottle
Vodka Bottle,Vodka,750,12,35.99
House Whiskey,Whiskey,1000,6,29.50
`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRowChange = (index: number, field: keyof Row, value: string) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addRow = () => setRows((prev) => [...prev, { name: "", category: "Other", bottleSizeMl: "750", startingQtyBottles: "0", costPerBottle: "0" }]);
  const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

  const parseCsv = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    return lines
      .slice(1)
      .map((line) => line.split(","))
      .map((values) => ({
        name: values[0]?.trim() || "",
        category: values[1]?.trim() || "Other",
        bottleSizeMl: values[2]?.trim() || "750",
        startingQtyBottles: values[3]?.trim() || "0",
        costPerBottle: values[4]?.trim() || "0",
      }))
      .filter((row) => row.name);
  };

  const handleFile = async (file: File) => {
    if (file.name.toLowerCase().endsWith(".xlsx")) {
      setError("Please export your spreadsheet as CSV before uploading. XLSX parsing is not yet enabled.");
      return;
    }
    const parsed = await parseCsv(file);
    if (parsed.length === 0) {
      setError("No rows found. Check your header row and data.");
      return;
    }
    setRows(parsed);
    setError(null);
    setMessage(`Loaded ${parsed.length} rows from ${file.name}. Review and save.`);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      await handleFile(file);
    } catch (err) {
      console.error(err);
      setError("Failed to read file. Please ensure it's CSV.");
    } finally {
      setUploading(false);
    }
  };

  const saveInventory = async () => {
    setError(null);
    setMessage(null);
    const items = rows
      .map((r) => ({
        name: r.name.trim(),
        category: r.category.trim() || "Other",
        bottleSizeMl: Number(r.bottleSizeMl) || 750,
        startingQtyBottles: Number(r.startingQtyBottles) || 0,
        costPerBottle: Number(r.costPerBottle) || 0,
      }))
      .filter((r) => r.name);

    if (items.length === 0) {
      setError("Add at least one inventory item.");
      return;
    }

    try {
      setUploading(true);
      const res = await fetch("/api/inventory/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barId, fileName: "manual-create", items }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save inventory");
      }
      setMessage(`Saved ${items.length} items. Returning to inventory...`);
      setTimeout(() => {
        window.location.href = `/dashboard/bar/${barId}/inventory`;
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to save inventory");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={downloadTemplate} className="btn-secondary px-4 py-2 text-sm">
          Download CSV template
        </button>
        <label className="btn-secondary px-4 py-2 text-sm cursor-pointer">
          {uploading ? "Loading..." : "Upload CSV"}
          <input type="file" accept=".csv,.xlsx" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
        <Link href={`/dashboard/bar/${barId}/inventory`} className="btn-secondary px-4 py-2 text-sm">
          Back to inventory
        </Link>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Create inventory</h3>
            <p className="text-sm text-slate-300">Add items manually or load from CSV. Save to apply.</p>
          </div>
          <button onClick={addRow} className="btn-primary px-3 py-2 text-sm">
            Add row
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm text-white">
            <thead className="text-slate-200">
              <tr className="text-left">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Size (ml)</th>
                <th className="py-2 pr-3">Qty (bottles)</th>
                <th className="py-2 pr-3">Cost/bottle</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-t border-white/5">
                  <td className="py-2 pr-3">
                    <input
                      value={row.name}
                      onChange={(e) => handleRowChange(idx, "name", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
                      placeholder="Bottle name"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      value={row.category}
                      onChange={(e) => handleRowChange(idx, "category", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
                      placeholder="Vodka, Tequila, etc."
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      value={row.bottleSizeMl}
                      onChange={(e) => handleRowChange(idx, "bottleSizeMl", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
                      type="number"
                      min={50}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      value={row.startingQtyBottles}
                      onChange={(e) => handleRowChange(idx, "startingQtyBottles", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
                      type="number"
                      min={0}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      value={row.costPerBottle}
                      onChange={(e) => handleRowChange(idx, "costPerBottle", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
                      type="number"
                      step="0.01"
                      min={0}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <button onClick={() => removeRow(idx)} className="text-xs text-red-300 hover:text-red-200">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {message}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={saveInventory} disabled={uploading} className="btn-primary px-4 py-3 text-sm disabled:opacity-60">
          {uploading ? "Saving..." : "Save inventory"}
        </button>
        <Link href={`/dashboard/bar/${barId}/inventory`} className="btn-secondary px-4 py-3 text-sm">
          Cancel
        </Link>
      </div>
    </div>
  );
}
