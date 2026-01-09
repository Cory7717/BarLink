import Navigation from "@/components/Navigation";
import BarProfileClient from "@/components/BarProfileClient";
import { prisma } from "@/lib/prisma";
import { DAYS_OF_WEEK } from "@/lib/constants";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageParams = {
  params: Promise<{ slug: string }>;
};

function formatDays(days: number[]) {
  if (!days || days.length === 0) return "Daily";
  return days
    .slice()
    .sort((a, b) => a - b)
    .map((day) => DAYS_OF_WEEK.find((d) => d.value === day)?.short || "")
    .filter(Boolean)
    .join(", ");
}

export default async function BarProfilePage({ params }: PageParams) {
  const { slug } = await params;

  const bar = await prisma.bar.findUnique({
    where: { slug },
    include: {
      events: {
        where: { isActive: true },
        orderBy: { startDate: "asc" },
        take: 8,
      },
      drinkSpecials: {
        where: { active: true },
        orderBy: { startTime: "asc" },
      },
      foodOfferings: {
        where: { active: true },
        orderBy: { name: "asc" },
      },
      staticOfferings: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!bar) {
    notFound();
  }

  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <BarProfileClient barId={bar.id} />
        <header className="glass-panel rounded-3xl p-6 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-cyan-200">Bar profile</p>
              <h1 className="text-3xl sm:text-4xl font-semibold text-gradient">{bar.name}</h1>
              <p className="text-sm text-slate-200 mt-2">
                {bar.address} • {bar.city}, {bar.state}
              </p>
              {bar.description && <p className="text-sm text-slate-300 mt-3 max-w-2xl">{bar.description}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                className="btn-primary px-4 py-2 text-sm"
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(bar.address)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get directions
              </a>
              {bar.website && (
                <a
                  className="btn-secondary px-4 py-2 text-sm"
                  href={bar.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit website
                </a>
              )}
              <Link href="/explore" className="btn-secondary px-4 py-2 text-sm">
                Back to Explore
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="glass-panel rounded-2xl p-4">
            <h2 className="text-sm text-cyan-200">Events</h2>
            <p className="text-3xl font-semibold text-white mt-2">{bar.events.length}</p>
            <p className="text-xs text-slate-300 mt-1">Active listings</p>
          </div>
          <div className="glass-panel rounded-2xl p-4">
            <h2 className="text-sm text-cyan-200">Drink specials</h2>
            <p className="text-3xl font-semibold text-white mt-2">{bar.drinkSpecials.length}</p>
            <p className="text-xs text-slate-300 mt-1">Live or scheduled</p>
          </div>
          <div className="glass-panel rounded-2xl p-4">
            <h2 className="text-sm text-cyan-200">Amenities</h2>
            <p className="text-3xl font-semibold text-white mt-2">{bar.staticOfferings.length}</p>
            <p className="text-xs text-slate-300 mt-1">Always available</p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="glass-panel rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-white">Upcoming events</h2>
            <div className="mt-4 space-y-3">
              {bar.events.length === 0 ? (
                <p className="text-sm text-slate-300">No upcoming events listed yet.</p>
              ) : (
                bar.events.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                      {event.category && (
                        <span className="rounded-full bg-cyan-500/20 border border-cyan-500/30 px-2 py-1 text-xs text-cyan-100">
                          {event.category}
                        </span>
                      )}
                      {event.isSpecial && (
                        <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-1 text-xs text-amber-100">
                          Special
                        </span>
                      )}
                    </div>
                    {event.description && <p className="text-sm text-slate-300 mt-2">{event.description}</p>}
                    <p className="text-xs text-slate-400 mt-2">
                      {event.startDate.toLocaleDateString()} • {event.startTime}
                      {event.endTime ? ` - ${event.endTime}` : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-white">Drink specials</h2>
              <div className="mt-4 space-y-3">
                {bar.drinkSpecials.length === 0 ? (
                  <p className="text-sm text-slate-300">No drink specials listed yet.</p>
                ) : (
                  bar.drinkSpecials.map((special) => (
                    <div key={special.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-sm font-semibold text-white">{special.name}</p>
                      {special.description && <p className="text-xs text-slate-300 mt-1">{special.description}</p>}
                      <p className="text-xs text-cyan-200 mt-2">
                        {special.startTime} - {special.endTime} • {formatDays(special.daysOfWeek)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-white">Food offerings</h2>
              <div className="mt-4 space-y-3">
                {bar.foodOfferings.length === 0 ? (
                  <p className="text-sm text-slate-300">No food offerings listed yet.</p>
                ) : (
                  bar.foodOfferings.map((food) => (
                    <div key={food.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-sm font-semibold text-white">{food.name}</p>
                      {food.description && <p className="text-xs text-slate-300 mt-1">{food.description}</p>}
                      <p className="text-xs text-slate-400 mt-2">
                        {food.isSpecial ? `Special on ${formatDays(food.specialDays)}` : "Always available"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-white">Amenities</h2>
              <div className="mt-4 space-y-3">
                {bar.staticOfferings.length === 0 ? (
                  <p className="text-sm text-slate-300">No amenities listed yet.</p>
                ) : (
                  bar.staticOfferings.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      {item.description && <p className="text-xs text-slate-300 mt-1">{item.description}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
