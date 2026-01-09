"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navigation from "@/components/Navigation";
import { formatCurrency } from "@/lib/utils";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import Link from "next/link";
import BetaModal from "@/components/BetaModal";

export default function PricingPage() {
  const plans = SUBSCRIPTION_PLANS;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleChoosePlan = (planId: string) => {
    setIsLoading(true);

    if (status === "authenticated" && session?.user?.email) {
      router.push(`/dashboard/subscription?plan=${planId}`);
    } else {
      router.push(`/auth/signup?plan=${planId}`);
    }
  };

  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <BetaModal />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-12">
        <header className="space-y-3 text-center">
          <p className="text-sm text-cyan-200">Owners</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-gradient">Stay visible with BarPulse</h1>
          <p className="text-slate-200">
            Publish your bar, keep offerings fresh, and appear in patron searches.
          </p>
        </header>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`group relative rounded-3xl border p-6 shadow-2xl transition-all duration-300 hover:shadow-cyan-500/20 hover:scale-[1.02] ${
                plan.popular
                  ? "border-cyan-400/40 bg-gradient-to-br from-cyan-500/10 to-amber-500/5"
                  : "border-white/10 bg-white/5"
              } ${plan.popular ? "ring-2 ring-cyan-400/20" : ""}`}
            >
              {plan.popular && (
                <span className="pill mb-3 inline-flex px-3 py-1 text-xs uppercase">
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
                <p className="text-xs text-cyan-200">
                  Save {formatCurrency((plan.originalPrice ?? 0) - plan.price)}
                </p>
              )}
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-cyan-300">*</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleChoosePlan(plan.id)}
                disabled={isLoading || status === "loading"}
                className={`mt-6 inline-flex w-full justify-center px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  plan.popular ? "btn-primary" : "btn-secondary"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? "Redirecting..." : `Choose ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <section className="mt-12 grid gap-6 glass-panel rounded-3xl p-6 md:grid-cols-2 shadow-lg">
          <div>
            <h3 className="text-xl font-semibold text-white">What is included</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              <li className="flex items-center gap-2">
                <span className="text-cyan-300">*</span> Unlimited offerings and events
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-300">*</span> Special and new badges with auto expiry
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-300">*</span> Map and list placement for active subscriptions
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-300">*</span> Owner billing portal for card updates and renewals
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-300">*</span> Basic analytics for views, searches, and clicks
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Questions</h3>
            <p className="text-sm text-slate-300">
              Need a custom setup or multiple locations? Email coryarmer@gmail.com and we will
              tailor a plan.
            </p>
            <Link href="/contact" className="mt-3 inline-flex text-cyan-200 hover:text-cyan-100 transition-colors font-medium">
              Contact support
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
