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
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-sm text-slate-400">Profile Views</h3>
          <p className="mt-2 text-3xl font-bold text-white">{analytics.summary.totalViews}</p>
          <p className="mt-1 text-xs text-slate-500">Last {timeframe} days</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-sm text-slate-400">Profile Clicks</h3>
          <p className="mt-2 text-3xl font-bold text-emerald-400">{analytics.summary.totalClicks}</p>
          <p className="mt-1 text-xs text-slate-500">{analytics.summary.averageClicksPerDay.toFixed(1)}/day avg</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-sm text-slate-400">Search Appearances</h3>
          <p className="mt-2 text-3xl font-bold text-blue-400">{analytics.summary.totalSearchAppears}</p>
          <p className="mt-1 text-xs text-slate-500">In search results</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-sm text-slate-400">Best Performing Day</h3>
          <p className="mt-2 text-lg font-bold text-white">
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
          <p className="mt-1 text-xs text-slate-500">
            {analytics.summary.bestDay ? `${analytics.summary.bestDay.profileClicks} clicks` : "No data"}
          </p>
        </div>
      </div>

      {/* Day of week trends */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-xl font-semibold text-white">Activity by Day of Week</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-7">
          {analytics.dayOfWeekTrends.map((trend) => (
            <div
              key={trend.day}
              className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-center"
            >
              <h3 className="text-sm font-semibold text-slate-300">{trend.dayName.slice(0, 3)}</h3>
              <p className="mt-3 text-2xl font-bold text-emerald-400">{trend.clicks}</p>
              <div className="mt-3 space-y-1 text-xs text-slate-400">
                <p>🔍 {trend.bySource.search}</p>
                <p>📍 {trend.bySource.map}</p>
                <p>❤️ {trend.bySource.favorites}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top search queries */}
      {analytics.topSearchQueries.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold text-white">Top Search Queries</h2>
          <div className="mt-4 space-y-2">
            {analytics.topSearchQueries.map((query, idx) => (
              <div key={query.id} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-300">
                    {idx + 1}
                  </span>
                  <span className="text-slate-200">{query.query}</span>
                </div>
                <span className="text-sm font-semibold text-slate-400">{query.count} searches</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top performing days */}
      {analytics.topDays.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
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
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {dayName}, {date.toLocaleDateString()}
                    </p>
                    <div className="mt-1 flex gap-4 text-sm text-slate-400">
                      <span>👁️ {day.profileViews} views</span>
                      <span>🔗 {day.profileClicks} clicks</span>
                      <span>🔍 {day.searchAppears} search appearances</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-400">{day.profileClicks}</p>
                    <p className="text-xs text-slate-500">clicks</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights and recommendations */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
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
