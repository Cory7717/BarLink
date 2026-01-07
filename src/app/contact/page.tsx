import Navigation from "@/components/Navigation";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-10 space-y-6">
        <header>
          <p className="text-sm text-emerald-200">Support</p>
          <h1 className="text-3xl font-bold">Contact BarPulse</h1>
          <p className="text-slate-300">Questions, issues, or feedback? We usually reply within one business day.</p>
        </header>

        <form className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-200">
              Name
              <input className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white" required />
            </label>
            <label className="text-sm text-slate-200">
              Email
              <input type="email" className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white" required />
            </label>
          </div>
          <label className="text-sm text-slate-200">
            Topic
            <select className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white">
              <option>General question</option>
              <option>Billing</option>
              <option>Report an issue</option>
              <option>Owner onboarding help</option>
            </select>
          </label>
          <label className="text-sm text-slate-200">
            Message
            <textarea className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-white" rows={4} required />
          </label>
          <button type="submit" className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
            Send message
          </button>
        </form>
      </main>
    </div>
  );
}
