import Navigation from "@/components/Navigation";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 space-y-8">
        <header>
          <p className="text-sm text-emerald-200">About</p>
          <h1 className="text-4xl font-bold">BarPulse</h1>
          <p className="text-slate-300">Real-time bar discovery that keeps patrons in the know and owners in control.</p>
        </header>

        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-2xl font-semibold">Our mission</h2>
          <p className="text-slate-200">
            BarPulse was built so nightlife isn&apos;t a guessing game. Owners can publish what&apos;s happening each night—trivia, karaoke,
            specials, live music—and patrons can find the right vibe instantly on a map.
          </p>
        </section>

        <section className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold">For patrons</h3>
            <p className="text-slate-200">Search by day and activity, filter for what&apos;s new or special, save favorites, and get directions fast.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">For owners</h3>
            <p className="text-slate-200">Subscribe to stay visible, manage your bar profile, publish offerings, and view basic analytics.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
