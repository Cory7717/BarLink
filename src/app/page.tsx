import Link from "next/link";
import Navigation from "@/components/Navigation";
import BetaModalWrapper from "@/components/BetaModalWrapper";
import { prisma } from "@/lib/prisma";

const steps = [
  {
    title: "List your bar",
    desc: "Create a profile, add your address, hours, and hero photo.",
  },
  {
    title: "Publish weekly offerings",
    desc: "Add trivia, karaoke, specials, and events by day and time. Flag new or special.",
  },
  {
    title: "Get discovered",
    desc: "Patrons search by day and activity on a live map and tap for directions.",
  },
];

const features = [
  "Map-first discovery with live filters",
  "Day-of-week and activity search",
  "Recurring events and one-offs",
  "Special and new badges with expiry",
  "Owner billing portal",
  "Patron favorites",
];

type HomeProps = {
  searchParams?: { city?: string };
};

export default async function Home({ searchParams }: HomeProps) {
  const cityFilter = searchParams?.city?.trim();
  const now = new Date();
  const featuredBoosts = await prisma.boost.findMany({
    where: {
      status: "ACTIVE",
      startAt: { lte: now },
      endAt: { gte: now },
      ...(cityFilter
        ? {
            bar: {
              city: { contains: cityFilter, mode: "insensitive" },
            },
          }
        : {}),
    },
    include: {
      bar: {
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          state: true,
          barType: true,
        },
      },
    },
    orderBy: [{ startAt: "desc" }],
    take: 6,
  });
  const hasFeatured = featuredBoosts.length > 0;

  return (
    <div className="min-h-screen app-shell text-white overflow-hidden">
      <BetaModalWrapper />
      {/* Animated gradient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-br from-slate-950/60 via-slate-900/40 to-slate-950/80"></div>
        <div className="absolute top-0 -left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-28 -right-10 w-72 h-72 bg-amber-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-float animation-delay-2000"></div>
        <div className="absolute -bottom-12 left-24 w-72 h-72 bg-emerald-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float animation-delay-4000"></div>
      </div>

      <Navigation />
      {/* Mobile quick actions so Explore is visible without the menu */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-4 sm:hidden">
        <div className="glass-panel rounded-2xl p-3 shadow-md border border-white/10">
          <div className="flex flex-col gap-2">
            <Link href="/explore" className="btn-primary w-full text-sm py-3">
              Explore bars
            </Link>
            <Link href="/pricing" className="btn-secondary w-full text-sm py-3">
              Pricing & plans
            </Link>
          </div>
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-16">
        <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-center animate-fade-in">
          <div className="space-y-6">
            <span className="pill inline-flex items-center px-3 py-1 text-xs uppercase">
              Live bar discovery
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold leading-tight text-gradient drop-shadow-lg">
              Discover bars by day, activity, and what is happening now
            </h1>
            <p className="text-lg text-slate-100 leading-relaxed drop-shadow-md">
              Owners stay visible with weekly updates. Patrons filter by day, activity, and
              special events, then see matching bars on an interactive map.
            </p>
          <div className="flex flex-col gap-3 sm:flex-row pt-4">
            <Link href="/auth/signup" className="btn-primary px-6 py-3 text-sm sm:text-base">
              List your bar
            </Link>
            <Link href="/explore" className="btn-secondary px-6 py-3 text-sm sm:text-base">
              Explore bars
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { label: "iOS (Coming Soon)", sub: "TestFlight launch planned", badge: "iOS" },
              { label: "Android (Coming Soon)", sub: "Play Store launch planned", badge: "Android" },
            ].map((item) => (
              <div
                key={item.label}
                className="group relative flex min-w-[220px] items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left shadow-sm pointer-events-none opacity-70"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-slate-300">{item.sub}</p>
                </div>
                <span className="rounded-full bg-slate-700 px-3 py-1 text-[11px] font-semibold text-slate-100 uppercase">
                  Coming Soon
                </span>
              </div>
            ))}
          </div>
            <div className="grid gap-3 sm:grid-cols-3 pt-4">
              {steps.map((step, idx) => (
                <div
                  key={step.title}
                  className={`glass-panel rounded-2xl p-4 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20 animation-delay-${idx * 100}`}
                >
                  <h3 className="text-lg font-semibold text-white">
                    {idx + 1}. {step.title}
                  </h3>
                  <p className="text-sm text-slate-100 mt-2">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Featured bars card */}
          <div className="glass-panel rounded-3xl p-6 shadow-2xl transition-all hover:shadow-cyan-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-100">
                  Featured {cityFilter ? `near ${cityFilter}` : "near you"}
                </p>
                <h2 className="text-2xl font-semibold text-gradient drop-shadow-lg">Featured bars</h2>
              </div>
              <span className="pill px-3 py-1 text-xs">Live map</span>
            </div>
            <div className="mt-6 space-y-3">
              {hasFeatured ? (
                featuredBoosts.map((boost) => (
                  <Link
                    key={boost.id}
                    href={boost.bar.slug ? `/bars/${boost.bar.slug}` : "/explore"}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all group hover:border-cyan-500/40 hover:bg-white/10"
                  >
                    <div className="text-white group-hover:text-cyan-100 transition-colors font-medium">
                      {boost.bar.name}
                      <span className="text-xs text-slate-300 ml-2">
                        {boost.bar.city}, {boost.bar.state}
                        {boost.bar.barType ? ` • ${boost.bar.barType}` : ""}
                      </span>
                    </div>
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/20 border border-amber-500/30 text-amber-100">
                      Sponsored
                    </span>
                  </Link>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  No featured bars yet. Owners can boost to appear here.
                </div>
              )}
            </div>
            <p className="mt-6 text-sm text-slate-100">
              Sponsored placements rotate and are localized. Owners can use Boost credits to appear in Featured and map highlights.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/explore" className="btn-secondary px-4 py-2 text-sm">
                View map
              </Link>
              <Link href="/pricing" className="btn-primary px-4 py-2 text-sm">
                Boost your bar
              </Link>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="mt-20 glass-panel rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gradient drop-shadow-lg mb-3">
              Why owners love BarLink
            </h2>
            <p className="text-slate-100 max-w-2xl mx-auto drop-shadow-md">
              Get discovered by the right patrons at the right time, and watch engagement soar.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white transition-all hover:border-cyan-400/40 hover:bg-white/10 hover:shadow-lg hover:shadow-cyan-500/20"
              >
                <div className="flex items-start gap-3">
                  <span className="text-cyan-300 text-lg mt-1">*</span>
                  <span className="font-medium">{feature}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {["Tourists", "Business travelers", "Locals"].map((audience) => (
              <span
                key={audience}
                className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white transition-all cursor-default font-medium hover:border-cyan-400/40 hover:bg-white/10"
              >
                Built for {audience}
              </span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
