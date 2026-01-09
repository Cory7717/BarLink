import { Suspense } from "react";
import Navigation from "@/components/Navigation";

function SuccessContent() {
  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-16 text-center">
        <div className="glass-panel rounded-3xl p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500">
            <svg className="h-8 w-8 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-white">Subscription activated!</h1>
          <p className="mt-3 text-slate-200">
            Your bar is now live on BarPulse. Head to your dashboard to add offerings and events.
          </p>
          <a
            href="/dashboard"
            className="mt-6 inline-flex btn-primary px-6 py-3 text-sm"
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
    <Suspense fallback={<div className="min-h-screen app-shell"></div>}>
      <SuccessContent />
    </Suspense>
  );
}
