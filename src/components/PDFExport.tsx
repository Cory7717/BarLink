"use client";

import { useState } from "react";
import { subDays, format } from "date-fns";

interface PDFExportProps {
  barId: string;
  barSlug: string;
}

export default function PDFExport({ barId, barSlug }: PDFExportProps) {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        barId,
        startDate,
        endDate,
      });

      const response = await fetch(`/api/inventory/report/pdf?${params.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate PDF');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BarLink360_InventoryReport_${barSlug}_${startDate}_to_${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('PDF report downloaded successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      alert(error instanceof Error ? error.message : 'Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">📄 Export Inventory Report (PDF)</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pdf-start-date" className="block text-sm font-semibold text-white mb-2">Start Date</label>
            <input
              id="pdf-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Select start date"
              className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="pdf-end-date" className="block text-sm font-semibold text-white mb-2">End Date</label>
            <input
              id="pdf-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Select end date"
              className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="rounded-lg bg-slate-800/60 p-3 text-xs text-slate-300">
          <p className="font-semibold mb-1">Report Includes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Executive summary with inventory value, usage, and variance</li>
            <li>Detailed item-by-item breakdown with costs and quantities</li>
            <li>Usage summary by day</li>
            <li>Alerts for low stock, high variance, and missing data</li>
          </ul>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full rounded-lg bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white hover:from-blue-400 hover:to-blue-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating PDF...
            </span>
          ) : (
            '📥 Download PDF Report'
          )}
        </button>
      </div>
    </div>
  );
}
