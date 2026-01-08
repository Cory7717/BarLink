import Link from "next/link";
import Navigation from "@/components/Navigation";

const steps = [
  {
    title: "List your bar",
    desc: "Create a profile, add your address, hours, and hero photo.",
  },
  {
    title: "Publish weekly offerings",
    desc: "Add trivia, karaoke, specials, and events by day/time—flag new or special.",
  },
  {
    title: "Get discovered",
    desc: "Patrons search by day & activity on a live map and tap for directions.",
  },
];

const features = [
  "Map-first discovery with live filters",
  "Day-of-week + activity search",
  "Recurring events & one-offs",
  "Special / new badges with expiry",
  "Owner billing portal",
  "Patron favorites",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-purple-900 to-slate-950 text-white overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-br from-purple-900/20 via-blue-900/20 to-slate-950/20"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-glow"></div>
        <div className="absolute top-40 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-glow animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-glow animation-delay-4000"></div>
      </div>

      <Navigation />
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-16">
        <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-center animate-fade-in">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-linear-to-r from-cyan-500/20 to-blue-500/20 px-3 py-1 text-sm font-semibold text-cyan-200 ring-1 ring-cyan-500/30 border border-cyan-500/20">
              ✨ Real-time bar discovery
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight bg-linear-to-r from-cyan-100 via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Discover bars by day, activity & what&apos;s happening now
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Owners subscribe to stay visible. Patrons filter by day-of-week, activity, and special events—then see matching bars on an interactive map.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row pt-4">
              <Link
                href="/auth/signup"
                className="group px-6 py-3 rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all hover:from-cyan-600 hover:to-blue-600 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
              >
                List your bar →
              </Link>
              <Link
                href="/explore"
                className="group px-6 py-3 rounded-lg border border-white/20 text-white font-semibold transition-all hover:border-cyan-400 hover:bg-white/10 backdrop-blur-sm"
              >
                Explore bars
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 pt-4">
              {steps.map((step, idx) => (
                <div 
                  key={step.title} 
                  className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 hover:bg-white/10 transition-all transform hover:scale-105 hover:shadow-lg animation-delay-${idx * 100}`}
                >
                  <h3 className="text-lg font-semibold text-cyan-100">{idx + 1}. {step.title}</h3>
                  <p className="text-sm text-slate-300 mt-2">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Featured bars card */}
          <div className="rounded-2xl border border-white/20 bg-linear-to-br from-white/10 to-white/5 backdrop-blur-md p-6 shadow-2xl hover:shadow-cyan-500/20 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Tonight · Seattle</p>
                <h2 className="text-2xl font-bold bg-linear-to-r from-cyan-100 to-blue-100 bg-clip-text text-transparent">Featured bars</h2>
              </div>
              <span className="rounded-full bg-linear-to-r from-cyan-500/20 to-blue-500/20 px-3 py-1 text-sm font-semibold text-cyan-200 ring-1 ring-cyan-500/30">
                🗺️ Live map
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {["Karaoke · Capitol Hill", "Trivia · Belltown", "Happy Hour · Ballard"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 hover:bg-white/10 transition-all group cursor-pointer">
                  <div className="text-white group-hover:text-cyan-100 transition-colors">{item}</div>
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-linear-to-r from-cyan-500 to-blue-500 text-white">NEW</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-slate-300">
              Patrons see both list and map, with clear badges for what&apos;s new or special.
            </p>
          </div>
        </section>

        {/* Features section */}
        <section className="mt-20 rounded-2xl border border-white/10 bg-linear-to-br from-white/10 to-white/5 backdrop-blur-md p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-cyan-100 via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3">Why owners love BarPulse</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">Get discovered by the right patrons at the right time, and watch engagement soar</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div 
                key={feature} 
                className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 text-sm text-slate-200 hover:bg-white/10 hover:border-cyan-400/50 transition-all transform hover:scale-105 hover:shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <span className="text-cyan-400 text-lg mt-1">✦</span>
                  <span>{feature}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {["Tourists", "Business travelers", "Locals"].map((audience) => (
              <span key={audience} className="rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-2 text-sm text-slate-300 hover:border-cyan-400/50 hover:bg-white/10 transition-all cursor-default">
                👥 {audience}
              </span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
