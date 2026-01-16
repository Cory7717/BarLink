import Navigation from "@/components/Navigation";

export default function AboutPage() {
  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-cyan-200">About</p>
          <h1 className="text-4xl font-semibold text-gradient">BarLink360</h1>
          <p className="text-slate-200">
            Real-time bar discovery that keeps patrons in the know and owners in control.
          </p>
        </header>

        <section className="glass-panel rounded-3xl p-6 shadow-lg space-y-3">
          <h2 className="text-2xl font-semibold text-white">Our mission</h2>
          <p className="text-slate-100">
            BarLink360 was built so nightlife is not a guessing game. Owners can publish what is
            happening each night, trivia, karaoke, specials, and live music, while patrons find
            the right vibe instantly on a map.
          </p>
        </section>

        <section className="grid gap-4 glass-panel rounded-3xl p-6 shadow-lg md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold text-white">For patrons</h3>
            <p className="text-slate-100">
              Search by day and activity, filter for what is new or special, save favorites, and
              get directions fast.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">For owners</h3>
            <p className="text-slate-100">
              Subscribe to stay visible, manage your bar profile, publish offerings, and view
              basic analytics.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
