"use client";

import { useState, useEffect } from "react";

interface AnalyticsData {
  summary: {
    totalClicks: number;
    totalViews: number;
    totalSearchAppears: number;
    averageClicksPerDay: number;
    bestDay?: {
      date: string;
      dayOfWeek: number;
      profileViews: number;
      profileClicks: number;
      searchAppears: number;
    };
  };
  dailyAnalytics: Array<{
    date: string;
    dayOfWeek: number;
    profileViews: number;
    profileClicks: number;
    searchAppears: number;
  }>;
  dayOfWeekTrends: Array<{
    day: number;
    dayName: string;
    clicks: number;
    bySource: {
      search: number;
      map: number;
      favorites: number;
      direct: number;
    };
  }>;
  topSearchQueries: Array<{
    id: string;
    query: string;
    count: number;
  }>;
  topDays: Array<{
    date: string;
    dayOfWeek: number;
    profileViews: number;
    profileClicks: number;
    searchAppears: number;
  }>;
}

export default function AnalyticsDashboard({ barId }: { barId: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(7);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/retrieve?barId=${barId}&days=${timeframe}`);
        const data = await res.json();
        if (res.ok) {
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [barId, timeframe]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-slate-300">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-slate-300">No analytics data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeframe selector */}
      <div className="flex gap-2">
        {[7, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => setTimeframe(days)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              timeframe === days
                ? "bg-emerald-500 text-slate-950"
                : "border border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            Last {days} days
          </button>
        ))}
      </div>

      {/* Summary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative rounded-xl border border-blue-500/30 bg-linear-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-md p-4 transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105">
          <h3 className="text-sm text-blue-300">Profile Views</h3>
          <p className="mt-2 text-3xl font-bold text-blue-100">{analytics.summary.totalViews}</p>
          <p className="mt-1 text-xs text-blue-400/70">Last {timeframe} days</p>
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-blue-500/0 to-blue-500/0 opacity-0 transition-opacity group-hover:opacity-20"></div>
        </div>

        <div className="group relative rounded-xl border border-emerald-500/30 bg-linear-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-md p-4 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105">
          <h3 className="text-sm text-emerald-300">Profile Clicks</h3>
          <p className="mt-2 text-3xl font-bold text-emerald-100">{analytics.summary.totalClicks}</p>
          <p className="mt-1 text-xs text-emerald-400/70">{analytics.summary.averageClicksPerDay.toFixed(1)}/day avg</p>
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-emerald-500/0 to-emerald-500/0 opacity-0 transition-opacity group-hover:opacity-20"></div>
        </div>

        <div className="group relative rounded-xl border border-purple-500/30 bg-linear-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-md p-4 transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105">
          <h3 className="text-sm text-purple-300">Search Appearances</h3>
          <p className="mt-2 text-3xl font-bold text-purple-100">{analytics.summary.totalSearchAppears}</p>
          <p className="mt-1 text-xs text-purple-400/70">In search results</p>
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-purple-500/0 to-purple-500/0 opacity-0 transition-opacity group-hover:opacity-20"></div>
        </div>

        <div className="group relative rounded-xl border border-amber-500/30 bg-linear-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-md p-4 transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-105">
          <h3 className="text-sm text-amber-300">Best Performing Day</h3>
          <p className="mt-2 text-lg font-bold text-amber-100">
            {analytics.summary.bestDay
              ? [
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ][analytics.summary.bestDay.dayOfWeek]
              : "N/A"}
          </p>
          <p className="mt-1 text-xs text-amber-400/70">
            {analytics.summary.bestDay ? `${analytics.summary.bestDay.profileClicks} clicks` : "No data"}
          </p>
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-amber-500/0 to-amber-500/0 opacity-0 transition-opacity group-hover:opacity-20"></div>
        </div>
      </div>

      {/* Day of week trends */}
      <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-white">Activity by Day of Week</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-7">
          {analytics.dayOfWeekTrends.map((trend) => (
            <div
              key={trend.day}
              className="group relative rounded-lg border border-emerald-500/20 bg-linear-to-br from-emerald-500/5 to-emerald-600/0 backdrop-blur-sm p-4 text-center transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105"
            >
              <h3 className="text-sm font-semibold text-slate-300">{trend.dayName.slice(0, 3)}</h3>
              <p className="mt-3 text-2xl font-bold text-emerald-400">{trend.clicks}</p>
              <div className="mt-3 space-y-1 text-xs text-slate-400">
                <p>🔍 <span className="text-blue-300">{trend.bySource.search}</span></p>
                <p>📍 <span className="text-amber-300">{trend.bySource.map}</span></p>
                <p>❤️ <span className="text-red-300">{trend.bySource.favorites}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top search queries */}
      {analytics.topSearchQueries.length > 0 && (
        <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white">Top Search Queries</h2>
          <div className="mt-4 space-y-2">
            {analytics.topSearchQueries.map((query, idx) => (
              <div key={query.id} className="group flex items-center justify-between rounded-lg border border-blue-500/20 bg-linear-to-r from-blue-500/5 to-transparent p-4 transition-all duration-300 hover:border-blue-500/50 hover:bg-blue-500/10">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-600 text-xs font-semibold text-white">
                    {idx + 1}
                  </span>
                  <span className="text-slate-200 font-medium">{query.query}</span>
                </div>
                <span className="text-sm font-semibold text-blue-300">{query.count} searches</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top performing days */}
      {analytics.topDays.length > 0 && (
        <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white">Top Performing Days</h2>
          <div className="mt-4 space-y-3">
            {analytics.topDays.map((day) => {
              const date = new Date(day.date);
              const dayName = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ][day.dayOfWeek];
              return (
                <div
                  key={day.date}
                  className="group flex items-center justify-between rounded-lg border border-emerald-500/20 bg-linear-to-r from-emerald-500/5 to-transparent p-4 transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/10"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {dayName}, {date.toLocaleDateString()}
                    </p>
                    <div className="mt-1 flex gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1"><span className="text-blue-300">👁️ {day.profileViews}</span></span>
                      <span className="flex items-center gap-1"><span className="text-emerald-300">🔗 {day.profileClicks}</span></span>
                      <span className="flex items-center gap-1"><span className="text-purple-300">🔍 {day.searchAppears}</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-300">{day.profileClicks}</p>
                    <p className="text-xs text-slate-500">clicks</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights and recommendations */}
      <div className="rounded-2xl border border-emerald-500/40 bg-linear-to-br from-emerald-500/15 to-emerald-600/5 backdrop-blur-md p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-emerald-200">Insights & Recommendations</h2>
        <ul className="mt-4 space-y-2 text-sm text-emerald-100/90">
          {analytics.dayOfWeekTrends.some((d) => d.clicks === 0) && (
            <li>
              📊 Consider promoting your bar on{" "}
              {analytics.dayOfWeekTrends
                .filter((d) => d.clicks === 0)
                .map((d) => d.dayName)
                .join(", ")}{" "}
              when engagement is low.
            </li>
          )}
          {analytics.topSearchQueries.length > 0 && (
            <li>
              🎯 Users are searching for &quot;{analytics.topSearchQueries[0].query}&quot; the most. Make sure your offerings
              highlight this.
            </li>
          )}
          {analytics.summary.bestDay && (
            <li>
              🌟 {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
                analytics.summary.bestDay.dayOfWeek
              ]}{" "}
              is your best day! Consider scheduling special events on this day.
            </li>
          )}
          {analytics.summary.averageClicksPerDay < 1 && (
            <li>💡 Engagement is low. Update your offerings and consider promoting your bar on social media.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
