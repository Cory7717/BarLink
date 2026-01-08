"use client";

import { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import { ACTIVITY_CATEGORIES, DAYS_OF_WEEK } from "@/lib/constants";
import { getCurrentDayIndex } from "@/lib/utils";
import dynamic from "next/dynamic";
// Local typing for the dynamically imported Map to avoid TS module resolution issues
type MapProps = {
  latitude: number;
  longitude: number;
  zoom: number;
  bars: { id: string; name: string; latitude: number; longitude: number; hasNew?: boolean; hasSpecial?: boolean }[];
};

const MapComponent = dynamic<MapProps>(() => import("../../components/MapComponent").then(m => m.default), { 
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-slate-400">Loading map...</div>
});

type BarResult = {
  id: string;
  name: string;
  address: string;
  city: string;
  distance?: number;
  latitude: number;
  longitude: number;
  todayOfferings: string[];
  nextUp?: string;
  hasNew?: boolean;
  hasSpecial?: boolean;
};

export default function ExplorePage() {
  const [day, setDay] = useState<number>(getCurrentDayIndex());
  const [activity, setActivity] = useState<string>("trivia");
  const [showSpecial, setShowSpecial] = useState(false);
  const [happeningNow, setHappeningNow] = useState(false);
  const [city, setCity] = useState("Seattle");
  const [bars, setBars] = useState<BarResult[]>([]);
  const [loading, setLoading] = useState(false);

  const mapCenter = useMemo(() => ({ latitude: 47.61, longitude: -122.33 }), []);

  // Fetch bars from API
  useEffect(() => {
    const fetchBars = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          day: String(day),
          activity,
          special: String(showSpecial),
          happeningNow: String(happeningNow),
        });
        if (city) params.append('city', city);

        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();
        
        if (res.ok) {
          setBars(data.bars || []);
        } else {
          setBars([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setBars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBars();
  }, [day, activity, showSpecial, happeningNow, city]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 text-white">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-emerald-300">Patron search</p>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">Explore bars by day & activity</h1>
            <p className="text-sm text-slate-200">Filters: day of week (required) + activity (required). Toggle special/new and happening now.</p>
          </div>
        </header>

        <section className="mt-6 grid gap-4 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-4 shadow-lg">
          <div className="grid gap-3 md:grid-cols-4">
            <label className="flex flex-col text-sm text-slate-200">
              Day of week
              <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="mt-2 rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-3 py-2 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm text-slate-200">
              Activity / offering
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="mt-2 rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-3 py-2 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              >
                {ACTIVITY_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm text-slate-200">
              City / neighborhood
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-2 rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-3 py-2 text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                placeholder="Seattle"
              />
            </label>
            <div className="flex flex-col justify-end gap-2 text-sm text-slate-200">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={happeningNow}
                  onChange={(e) => setHappeningNow(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900"
                />
                Happening now / tonight
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showSpecial}
                  onChange={(e) => setShowSpecial(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900"
                />
                Special / new only
              </label>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-3">
            {loading ? (
              <div className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 text-center text-slate-200 shadow-lg">
                Loading bars...
              </div>
            ) : bars.length === 0 ? (
              <div className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 text-center text-slate-200 shadow-lg">
                No bars match your filters. Try a different activity or broaden the day/time.
              </div>
            ) : (
              bars.map((bar) => (
                <div key={bar.id} className="group relative rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-4 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {bar.name}
                        {bar.hasNew && <span className="ml-2 rounded-full bg-sky-500/20 border border-sky-500/30 px-2 py-1 text-xs text-sky-100">NEW</span>}
                        {bar.hasSpecial && <span className="ml-2 rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-1 text-xs text-amber-100">SPECIAL</span>}
                      </h3>
                      <p className="text-sm text-slate-200">{bar.address}, {bar.city}</p>
                      {bar.distance !== undefined && (
                        <p className="text-xs text-slate-300">{bar.distance.toFixed(1)} mi away</p>
                      )}
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(bar.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-emerald-300 hover:text-emerald-100 transition-colors"
                    >
                      Get directions →
                    </a>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-100">
                    {bar.todayOfferings.map((o) => (
                      <span key={o} className="rounded-full border border-slate-600/50 bg-slate-700/50 backdrop-blur-sm px-3 py-1">{o}</span>
                    ))}
                  </div>
                  {bar.nextUp && <p className="mt-2 text-xs text-slate-300">Next: {bar.nextUp}</p>}
                </div>
              ))
            )}
          </div>

          <div className="h-80 lg:h-130 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-2 shadow-lg overflow-hidden">
            <MapComponent
              latitude={mapCenter.latitude}
              longitude={mapCenter.longitude}
              zoom={11}
              bars={bars}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
