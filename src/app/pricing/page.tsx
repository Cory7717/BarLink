"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navigation from "@/components/Navigation";
import { formatCurrency } from "@/lib/utils";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import Link from "next/link";

export default function PricingPage() {
  const plans = SUBSCRIPTION_PLANS;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleChoosePlan = (planId: string) => {
    setIsLoading(true);

    if (status === "authenticated" && session?.user?.email) {
      // User is logged in - send them to onboarding first
      // They'll create/confirm their bar, then be sent to payment
      router.push(`/onboarding?plan=${planId}`);
    } else {
      // User not logged in - go to signup first
      // They'll complete signup, then onboarding, then payment
      router.push(`/auth/signup?plan=${planId}`);
    }
  };

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
              className={`group relative rounded-2xl border backdrop-blur-md p-6 shadow-2xl transition-all duration-300 hover:shadow-emerald-500/20 hover:scale-105 ${
                plan.popular
                  ? "border-emerald-400/50 bg-linear-to-br from-emerald-500/10 to-emerald-600/5"
                  : "border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40"
              } ${plan.popular ? "ring-2 ring-emerald-400/30" : ""}`}
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
              <button
                onClick={() => handleChoosePlan(plan.id)}
                disabled={isLoading || status === "loading"}
                className={`mt-6 inline-flex w-full justify-center rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  plan.popular
                    ? "bg-linear-to-r from-emerald-500 to-emerald-600 text-slate-950 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95"
                    : "bg-slate-700 text-white hover:bg-slate-600 active:scale-95"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? "Redirecting..." : `Choose ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <section className="mt-12 grid gap-6 rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 md:grid-cols-2 shadow-lg">
          <div>
            <h3 className="text-xl font-semibold text-white">What&apos;s included</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Unlimited offerings & events</li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Special/new badges with auto-expiry</li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Map + list placement for active subscriptions</li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Owner billing portal (update card, cancel, renewal date)</li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Basic analytics: profile views, search appearances, top clicks</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Questions</h3>
            <p className="text-sm text-slate-300">
              Need a custom setup or multiple locations? Email support@barpulse.com and we&apos;ll help tailor a plan.
            </p>
            <Link href="/contact" className="mt-3 inline-flex text-emerald-300 hover:text-emerald-200 transition-colors font-medium">
              Contact support →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
