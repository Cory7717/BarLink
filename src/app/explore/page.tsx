"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import { DAYS_OF_WEEK } from "@/lib/constants";
import { DEFAULT_ACTIVITY_CATEGORIES } from "@/lib/activityCategories";
import { getCurrentDayIndex } from "@/lib/utils";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type MapProps = {
  latitude: number;
  longitude: number;
  zoom: number;
  bars: { id: string; slug: string; name: string; latitude: number; longitude: number; hasNew?: boolean; hasSpecial?: boolean }[];
};

const MapComponent = dynamic<MapProps>(
  () => import("../../components/MapComponent").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center text-slate-300">
        Loading map...
      </div>
    ),
  }
);

type BarResult = {
  id: string;
  slug: string;
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

type EventCategory = {
  name: string;
  displayName: string;
  icon?: string | null;
};

const fallbackCategories: EventCategory[] = DEFAULT_ACTIVITY_CATEGORIES.map((category) => ({
  name: category.name,
  displayName: category.displayName,
}));

function ExploreContent() {
  const [day, setDay] = useState<number>(getCurrentDayIndex());
  const [activity, setActivity] = useState<string>("trivia");
  const [keyword, setKeyword] = useState<string>("");
  const [showSpecial, setShowSpecial] = useState(false);
  const [happeningNow, setHappeningNow] = useState(false);
  const [city, setCity] = useState("Seattle");
  const [distance, setDistance] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number }>({
    latitude: 47.61,
    longitude: -122.33,
  });
  const [bars, setBars] = useState<BarResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoSearch, setAutoSearch] = useState(true);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setMapCenter({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          console.log("Geolocation permission denied or unavailable");
        }
      );
    }
  }, []);

  useEffect(() => {
    if (hasInitialized) return;
    const params = new URLSearchParams(searchParams.toString());
    const dayParam = params.get("day");
    const activityParam = params.get("activity");
    const keywordParam = params.get("q");
    const cityParam = params.get("city");
    const distanceParam = params.get("distance");
    const specialParam = params.get("special");
    const happeningParam = params.get("happeningNow");
    const autoParam = params.get("auto");

    if (dayParam) setDay(Number(dayParam));
    if (activityParam) setActivity(activityParam);
    if (keywordParam) setKeyword(keywordParam);
    if (cityParam) setCity(cityParam);
    if (distanceParam) setDistance(Number(distanceParam));
    if (specialParam) setShowSpecial(specialParam === "true");
    if (happeningParam) setHappeningNow(happeningParam === "true");
    if (autoParam) setAutoSearch(autoParam === "true");

    setHasInitialized(true);
  }, [hasInitialized, searchParams]);

  useEffect(() => {
    if (!hasInitialized) return;
    const params = new URLSearchParams();
    params.set("day", String(day));
    params.set("activity", activity);
    if (keyword.trim()) params.set("q", keyword.trim());
    if (city.trim()) params.set("city", city.trim());
    if (distance !== null) params.set("distance", String(distance));
    if (showSpecial) params.set("special", "true");
    if (happeningNow) params.set("happeningNow", "true");
    params.set("auto", autoSearch ? "true" : "false");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [
    activity,
    autoSearch,
    city,
    day,
    distance,
    happeningNow,
    hasInitialized,
    keyword,
    pathname,
    router,
    showSpecial,
  ]);

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/event-categories");
        const data = await res.json();
        if (isMounted && res.ok) {
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !categories.some((cat) => cat.name === activity)) {
      setActivity(categories[0].name);
    }
  }, [activity, categories]);

  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        day: String(day),
        activity,
        special: String(showSpecial),
        happeningNow: String(happeningNow),
      });
      if (keyword.trim()) params.append("q", keyword.trim());
      if (city) params.append("city", city);
      if (distance && userLocation) {
        params.append("distance", String(distance));
        params.append("userLatitude", String(userLocation.latitude));
        params.append("userLongitude", String(userLocation.longitude));
      }

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();

      if (res.ok) {
        setBars(data.bars || []);
        const first = (data.bars || [])[0];
        if (userLocation) {
          setMapCenter(userLocation);
        } else if (first) {
          setMapCenter({ latitude: first.latitude, longitude: first.longitude });
        }
      } else {
        console.error("Search error:", data.error);
        setBars([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setBars([]);
    } finally {
      setLoading(false);
    }
  }, [activity, city, day, distance, happeningNow, keyword, showSpecial, userLocation]);

  useEffect(() => {
    if (autoSearch) {
      performSearch();
    }
  }, [autoSearch, performSearch]);

  const activityOptions = categories.length > 0 ? categories : fallbackCategories;

  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-cyan-200">Patron search</p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-gradient">
              Explore bars by day and activity
            </h1>
            <p className="text-sm text-slate-200">
              Filters: day and activity required. Toggle special or happening now to refine.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="pill px-3 py-1 text-xs uppercase">Live map</span>
          </div>
        </header>

        <section className="mt-6 glass-panel rounded-3xl p-5 shadow-lg">
          <div className="grid gap-3 md:grid-cols-6">
            <label className="flex flex-col text-sm text-slate-200">
              Day of week
              <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30 transition-all"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm text-slate-200">
              Activity or offering
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30 transition-all"
              >
                {activityOptions.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm text-slate-200">
              City or neighborhood
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                placeholder="Seattle"
              />
            </label>
            <label className="flex flex-col text-sm text-slate-200">
              Keyword (optional)
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                placeholder="Sweepstakes, darts, bingo..."
              />
              <span className="mt-2 text-xs text-slate-400">
                Searches event titles, specials, and amenities.
              </span>
            </label>
            <label className="flex flex-col text-sm text-slate-200">
              Distance {userLocation ? "(near you)" : ""}
              <select
                value={distance || ""}
                onChange={(e) => setDistance(e.target.value ? Number(e.target.value) : null)}
                className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30 transition-all"
                disabled={!userLocation}
                title={
                  userLocation
                    ? "Filter by distance from your location"
                    : "Enable location services to use distance filter"
                }
              >
                <option value="">All distances</option>
                <option value="5">Within 5 miles</option>
                <option value="10">Within 10 miles</option>
                <option value="25">Within 25 miles</option>
              </select>
            </label>
            <div className="flex flex-col justify-end gap-3 text-sm text-slate-200">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={happeningNow}
                  onChange={(e) => setHappeningNow(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 accent-cyan-400"
                />
                Happening now or tonight
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showSpecial}
                  onChange={(e) => setShowSpecial(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 accent-cyan-400"
                />
                Special or new only
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoSearch}
                  onChange={(e) => setAutoSearch(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 accent-cyan-400"
                />
                Auto update
              </label>
              {!autoSearch && (
                <button
                  type="button"
                  onClick={performSearch}
                  disabled={loading}
                  className="btn-primary px-4 py-2 text-xs"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-3">
            {loading ? (
              <div className="glass-panel rounded-2xl p-6 text-center text-slate-200 shadow-lg">
                Loading bars...
              </div>
            ) : bars.length === 0 ? (
              <div className="glass-panel rounded-2xl p-6 text-center text-slate-200 shadow-lg">
                No bars match your filters. Try a different activity or broaden the day or time.
              </div>
            ) : (
              bars.map((bar) => (
                <div
                  key={bar.id}
                  className="group relative rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.01]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {bar.name}
                        {bar.hasNew && (
                          <span className="ml-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 px-2 py-1 text-xs text-cyan-100">
                            NEW
                          </span>
                        )}
                        {bar.hasSpecial && (
                          <span className="ml-2 rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-1 text-xs text-amber-100">
                            SPECIAL
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-200">
                        {bar.address}, {bar.city}
                      </p>
                      {bar.distance !== undefined && (
                        <p className="text-xs text-slate-300">{bar.distance.toFixed(1)} mi away</p>
                      )}
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        bar.address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-cyan-200 hover:text-cyan-100 transition-colors"
                    >
                      Get directions
                    </a>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-100">
                    {bar.todayOfferings.map((o) => (
                      <span
                        key={o}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                      >
                        {o}
                      </span>
                    ))}
                  </div>
                  {bar.nextUp && <p className="mt-2 text-xs text-slate-300">Next: {bar.nextUp}</p>}
                </div>
              ))
            )}
          </div>

          <div className="h-80 lg:h-120 rounded-3xl border border-white/10 bg-white/5 p-2 shadow-lg overflow-hidden">
            <MapComponent latitude={mapCenter.latitude} longitude={mapCenter.longitude} zoom={11} bars={bars} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen app-shell text-white flex items-center justify-center">Loading...</div>}
    >
      <ExploreContent />
    </Suspense>
  );
}
