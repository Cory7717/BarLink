import { Suspense } from "react";
import Navigation from "@/components/Navigation";

function SuccessContent() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-16 text-center">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500">
            <svg className="h-8 w-8 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Subscription activated!</h1>
          <p className="mt-3 text-slate-200">
            Your bar is now live on BarPulse. Head to your dashboard to add offerings and events.
          </p>
          <a
            href="/dashboard"
            className="mt-6 inline-flex rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Go to dashboard
          </a>
        </div>
      </main>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950"></div>}>
      <SuccessContent />
    </Suspense>
  );
}
