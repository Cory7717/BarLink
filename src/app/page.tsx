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
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-950 to-black text-white">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-16">
        <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-500/30">
              Real-time bar discovery
            </span>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              BarPulse connects patrons to bars by day, activity, and what&apos;s live right now.
            </h1>
            <p className="text-lg text-slate-200/80">
              Owners subscribe to stay visible. Patrons filter by day-of-week, activity, and special events—then see matching bars on an interactive map.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/signup"
                className="rounded-lg bg-emerald-500 px-5 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-px hover:shadow-xl hover:shadow-emerald-500/40"
              >
                List your bar
              </Link>
              <Link
                href="/explore"
                className="rounded-lg border border-slate-700 px-5 py-3 text-base font-semibold text-white transition hover:border-emerald-400 hover:text-emerald-200"
              >
                Explore bars
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {steps.map((step) => (
                <div key={step.title} className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  <p className="text-sm text-slate-300/80">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-2xl shadow-emerald-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300/80">Tonight · Seattle</p>
                <h2 className="text-2xl font-semibold text-white">Featured bars</h2>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-500/30">
                Live map
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {["Karaoke · Capitol Hill", "Trivia · Belltown", "Happy Hour · Ballard"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3">
                  <div className="text-white">{item}</div>
                  <span className="text-xs font-semibold text-emerald-200">NEW</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-300/80">
              Patons see both the list and the map, with clear badges for what&apos;s new or special.
            </p>
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-8 shadow-inner shadow-black/50">
          <h2 className="text-2xl font-semibold text-white">Why owners use BarPulse</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200">
                {feature}
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300/80">
            <span className="rounded-full border border-slate-700 px-3 py-1">Tourists</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">Business travelers</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">Locals</span>
          </div>
        </section>
      </main>
    </div>
  );
}
