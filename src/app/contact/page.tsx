import Navigation from "@/components/Navigation";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 text-white">
      <Navigation />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-10 space-y-6">
        <header>
          <p className="text-sm text-emerald-300">Support</p>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">Contact BarPulse</h1>
          <p className="text-slate-200">Questions, issues, or feedback? We usually reply within one business day.</p>
        </header>

        <form className="space-y-4 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-100">
              Name
              <input className="mt-2 w-full rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-3 py-2 text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" required />
            </label>
            <label className="text-sm text-slate-100">
              Email
              <input type="email" className="mt-2 w-full rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-3 py-2 text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" required />
            </label>
          </div>
          <label className="text-sm text-slate-100">
            Topic
            <select className="mt-2 w-full rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-3 py-2 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all">
              <option>General question</option>
              <option>Billing</option>
              <option>Report an issue</option>
              <option>Owner onboarding help</option>
            </select>
          </label>
          <label className="text-sm text-slate-100">
            Message
            <textarea className="mt-2 w-full rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-3 py-3 text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" rows={4} required />
          </label>
          <button type="submit" className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
            Send message
          </button>
        </form>
      </main>
    </div>
  );
}
