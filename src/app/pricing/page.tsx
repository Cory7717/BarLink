import Navigation from "@/components/Navigation";
import { formatCurrency } from "@/lib/utils";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import Link from "next/link";

export default function PricingPage() {
  const plans = SUBSCRIPTION_PLANS;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-12">
        <header className="space-y-3 text-center">
          <p className="text-sm text-emerald-200">Owners</p>
          <h1 className="text-4xl font-bold">Stay visible with BarPulse</h1>
          <p className="text-slate-300">Publish your bar, keep offerings fresh, and appear in patron searches.</p>
        </header>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl ${plan.popular ? "ring-2 ring-emerald-400" : ""}`}
            >
              {plan.popular && (
                <span className="mb-3 inline-flex rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-500/40">
                  Most popular
                </span>
              )}
              <h2 className="text-2xl font-semibold text-white">{plan.name}</h2>
              <p className="mt-2 text-sm text-slate-300">{plan.description}</p>
              <div className="mt-4 flex items-baseline gap-1 text-white">
                <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                <span className="text-sm text-slate-400">/{plan.interval}</span>
              </div>
              {plan.originalPrice && (
                <p className="text-xs text-emerald-200">Save {formatCurrency((plan.originalPrice ?? 0) - plan.price)}</p>
              )}
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-emerald-300">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/auth/signup?plan=${plan.id}`}
                className="mt-6 inline-flex w-full justify-center rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>

        <section className="mt-12 grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold text-white">What&apos;s included</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              <li>Unlimited offerings & events</li>
              <li>Special/new badges with auto-expiry</li>
              <li>Map + list placement for active subscriptions</li>
              <li>Owner billing portal (update card, cancel, renewal date)</li>
              <li>Basic analytics: profile views, search appearances, top clicks</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Questions</h3>
            <p className="text-sm text-slate-300">
              Need a custom setup or multiple locations? Email support@barpulse.com and we&apos;ll help tailor a plan.
            </p>
            <Link href="/contact" className="mt-3 inline-flex text-emerald-200 hover:text-emerald-100">
              Contact support →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
