'use client';

import { useState, useEffect } from 'react';

interface ROIMetrics {
  totalViews: number;
  totalClicks: number;
  totalVisits: number;
  clickThroughRate: number;
  visitConversionRate: number;
  overallConversionRate: number;
  visitsBySource: {
    qr_code: number;
    promo_code: number;
    manual: number;
    location: number;
  };
  averageTimeToVisit: number;
  repeatVisitorRate: number;
  estimatedRevenue: number;
  costPerVisit: number;
  returnOnInvestment: number;
  dailyVisits: Array<{
    date: string;
    visits: number;
    views: number;
    clicks: number;
  }>;
  peakVisitTimes: Array<{
    hour: number;
    count: number;
  }>;
  topVisitDays: Array<{
    dayOfWeek: number;
    dayName: string;
    visits: number;
  }>;
}

export default function ROIDashboard({ barId }: { barId: string }) {
  const [metrics, setMetrics] = useState<ROIMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(30);
  const [settings, setSettings] = useState({
    subscriptionCost: 29,
    averageCheckSize: 25,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          barId,
          days: String(timeframe),
          subscriptionCost: String(settings.subscriptionCost),
          averageCheckSize: String(settings.averageCheckSize),
        });
        
        const res = await fetch(`/api/analytics/roi?${params}`);
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Failed to fetch ROI metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [barId, timeframe, settings]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
        <p className="text-slate-300">Loading ROI metrics...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
        <p className="text-slate-300">No data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeframe selector */}
      <div className="flex flex-wrap gap-2">
        {[7, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => setTimeframe(days)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              timeframe === days
                ? 'bg-emerald-500 text-slate-950'
                : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Last {days} days
          </button>
        ))}
      </div>

      {/* ROI Highlight */}
      <div className="rounded-2xl border border-emerald-500/50 bg-linear-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-md p-8 shadow-lg text-center">
        <h2 className="text-sm font-semibold text-emerald-300 mb-2">Return on Investment</h2>
        <p className="text-6xl font-bold text-emerald-100 mb-2">
          {metrics.returnOnInvestment >= 0 ? '+' : ''}{metrics.returnOnInvestment.toFixed(0)}%
        </p>
        <p className="text-emerald-200/80">
          ${metrics.estimatedRevenue.toFixed(2)} estimated revenue from {metrics.totalVisits} verified visits
        </p>
      </div>

      {/* Conversion Funnel */}
      <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-6">Conversion Funnel</h2>
        <div className="space-y-4">
          {/* Views */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">👁️ Profile Views</span>
              <span className="text-lg font-bold text-white">{metrics.totalViews.toLocaleString()}</span>
            </div>
            <div className="h-12 rounded-lg bg-slate-800 overflow-hidden">
              <div className="h-full bg-linear-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold" style={{ width: '100%' }}>
                100%
              </div>
            </div>
          </div>

          {/* Clicks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">🔗 Engaged (Clicks)</span>
              <span className="text-lg font-bold text-white">{metrics.totalClicks.toLocaleString()}</span>
            </div>
            <div className="h-12 rounded-lg bg-slate-800 overflow-hidden">
              <div className="h-full bg-linear-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold" style={{ width: `${metrics.clickThroughRate * 100}%` }}>
                {(metrics.clickThroughRate * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Visits */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">✅ Verified Visits</span>
              <span className="text-lg font-bold text-emerald-400">{metrics.totalVisits.toLocaleString()}</span>
            </div>
            <div className="h-12 rounded-lg bg-slate-800 overflow-hidden">
              <div className="h-full bg-linear-to-r from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold" style={{ width: `${metrics.overallConversionRate * 100}%` }}>
                {(metrics.overallConversionRate * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-emerald-500/30 bg-linear-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-md p-4">
          <h3 className="text-sm text-emerald-300">Cost per Visit</h3>
          <p className="mt-2 text-3xl font-bold text-emerald-100">${metrics.costPerVisit.toFixed(2)}</p>
          <p className="mt-1 text-xs text-emerald-400/70">Per verified patron</p>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-linear-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-md p-4">
          <h3 className="text-sm text-blue-300">Avg Time to Visit</h3>
          <p className="mt-2 text-3xl font-bold text-blue-100">{metrics.averageTimeToVisit.toFixed(1)}h</p>
          <p className="mt-1 text-xs text-blue-400/70">From discovery</p>
        </div>

        <div className="rounded-xl border border-purple-500/30 bg-linear-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-md p-4">
          <h3 className="text-sm text-purple-300">Repeat Visitors</h3>
          <p className="mt-2 text-3xl font-bold text-purple-100">{(metrics.repeatVisitorRate * 100).toFixed(0)}%</p>
          <p className="mt-1 text-xs text-purple-400/70">Came back</p>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-linear-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-md p-4">
          <h3 className="text-sm text-amber-300">Est. Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-amber-100">${metrics.estimatedRevenue.toFixed(0)}</p>
          <p className="mt-1 text-xs text-amber-400/70">From verified visits</p>
        </div>
      </div>

      {/* Visit Sources */}
      <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Visit Sources</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-emerald-500/20 bg-linear-to-r from-emerald-500/5 to-transparent p-4">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="text-sm text-slate-300">QR Code Scans</h3>
            <p className="text-2xl font-bold text-emerald-200">{metrics.visitsBySource.qr_code}</p>
          </div>
          <div className="rounded-lg border border-blue-500/20 bg-linear-to-r from-blue-500/5 to-transparent p-4">
            <div className="text-2xl mb-2">🎟️</div>
            <h3 className="text-sm text-slate-300">Promo Codes</h3>
            <p className="text-2xl font-bold text-blue-200">{metrics.visitsBySource.promo_code}</p>
          </div>
          <div className="rounded-lg border border-purple-500/20 bg-linear-to-r from-purple-500/5 to-transparent p-4">
            <div className="text-2xl mb-2">✋</div>
            <h3 className="text-sm text-slate-300">Self Check-in</h3>
            <p className="text-2xl font-bold text-purple-200">{metrics.visitsBySource.manual}</p>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-linear-to-r from-amber-500/5 to-transparent p-4">
            <div className="text-2xl mb-2">📍</div>
            <h3 className="text-sm text-slate-300">Location</h3>
            <p className="text-2xl font-bold text-amber-200">{metrics.visitsBySource.location}</p>
          </div>
        </div>
      </div>

      {/* Peak Visit Times */}
      {metrics.peakVisitTimes.length > 0 && (
        <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Peak Visit Hours</h2>
          <div className="space-y-3">
            {metrics.peakVisitTimes.map((time) => {
              const hour12 = time.hour % 12 || 12;
              const ampm = time.hour >= 12 ? 'PM' : 'AM';
              const percentage = metrics.totalVisits > 0 ? (time.count / metrics.totalVisits) * 100 : 0;
              
              return (
                <div key={time.hour}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{hour12}:00 {ampm}</span>
                    <span className="text-emerald-300">{time.count} visits</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-emerald-500 to-emerald-600"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Visit Days */}
      {metrics.topVisitDays.length > 0 && (
        <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Busiest Days</h2>
          <div className="grid gap-2 sm:grid-cols-7">
            {metrics.topVisitDays.map((day) => {
              const maxVisits = Math.max(...metrics.topVisitDays.map(d => d.visits));
              const percentage = maxVisits > 0 ? (day.visits / maxVisits) * 100 : 0;
              
              return (
                <div key={day.dayOfWeek} className="text-center">
                  <div className="text-xs text-slate-400 mb-2">{day.dayName.slice(0, 3)}</div>
                  <div className="relative h-24 bg-slate-800 rounded-lg overflow-hidden flex flex-col justify-end">
                    <div
                      className="bg-linear-to-t from-emerald-500 to-emerald-600"
                      style={{ height: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm font-bold text-emerald-300 mt-2">{day.visits}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">ROI Calculator Settings</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Monthly Subscription Cost ($)</label>
            <input
              type="number"
              value={settings.subscriptionCost}
              onChange={(e) => setSettings({ ...settings, subscriptionCost: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-4 py-2 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Average Check Size ($)</label>
            <input
              type="number"
              value={settings.averageCheckSize}
              onChange={(e) => setSettings({ ...settings, averageCheckSize: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-4 py-2 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          💡 Adjust these values to see how they impact your ROI calculations. These are estimates for visualization.
        </p>
      </div>
    </div>
  );
}
