"use client";

import { useState, useEffect } from "react";

interface VarianceAlert {
  id: string;
  inventoryItemId: string;
  periodStart: Date;
  periodEnd: Date;
  expectedMl: number;
  observedMl: number;
  varianceMl: number;
  variancePct: number;
  severity: string;
  reasonHint: string | null;
  createdAt: Date;
  inventoryItem?: {
    name: string;
    category: string | null;
  };
}

interface VarianceAlertsProps {
  barId: string;
}

export default function VarianceAlerts({ barId }: VarianceAlertsProps) {
  const [alerts, setAlerts] = useState<VarianceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barId]);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`/api/inventory/variance-alerts?barId=${barId}`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Failed to fetch variance alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'border-red-500/30 bg-red-500/10 text-red-100';
      case 'medium':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-100';
      case 'low':
        return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-100';
      default:
        return 'border-slate-600/30 bg-slate-600/10 text-slate-100';
    }
  };

  if (loading) {
    return <div className="text-center text-slate-400 py-4">Loading alerts...</div>;
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 text-center">
        <p className="text-emerald-100">✅ No variance alerts. Your inventory is on track!</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">⚠️ Variance Alerts</h3>
      <div className="space-y-3">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`rounded-lg border p-4 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold">{alert.inventoryItem?.name || 'Unknown Item'}</p>
                <p className="text-xs opacity-80">{alert.inventoryItem?.category}</p>
              </div>
              <span className="rounded-full px-2 py-1 text-xs font-semibold bg-black/20">
                {alert.severity.toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <div>
                <span className="opacity-70">Expected:</span> {alert.expectedMl.toFixed(0)}ml
              </div>
              <div>
                <span className="opacity-70">Observed:</span> {alert.observedMl.toFixed(0)}ml
              </div>
              <div className="col-span-2">
                <span className="opacity-70">Variance:</span> {alert.varianceMl.toFixed(0)}ml ({alert.variancePct.toFixed(1)}%)
              </div>
            </div>

            {alert.reasonHint && (
              <p className="text-xs opacity-90 mt-2">💡 {alert.reasonHint}</p>
            )}

            <p className="text-xs opacity-60 mt-2">
              {new Date(alert.periodStart).toLocaleDateString()} - {new Date(alert.periodEnd).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
