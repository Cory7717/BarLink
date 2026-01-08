"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Navigation from "@/components/Navigation";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import Link from "next/link";

function SubscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const planKey = searchParams.get("plan") || "monthly";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ownerData, setOwnerData] = useState<{ ownerId: string; owner: { id: string; email: string; name: string } } | null>(null);
  const [hasBar, setHasBar] = useState(false);

  useEffect(() => {
    // Redirect to pricing if not authenticated
    if (status === "unauthenticated") {
      router.push("/pricing");
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch owner data including bar info
    const fetchOwnerData = async () => {
      try {
        const res = await fetch("/api/auth/owner");
        const data = await res.json();

        if (res.ok && data.ownerId) {
          setOwnerData(data);

          // Check if owner has a bar
          const barRes = await fetch(`/api/bars?ownerId=${data.ownerId}`);
          const barData = await barRes.json();
          setHasBar(barData.bars && barData.bars.length > 0);
        }
      } catch (err) {
        console.error("Failed to fetch owner data:", err);
      }
    };

    if (status === "authenticated") {
      fetchOwnerData();
    }
  }, [status]);

  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === planKey);

  const handleCreateSubscription = async () => {
    setError("");
    setLoading(true);

    try {
      if (!ownerData?.ownerId) {
        setError("Could not find owner account");
        setLoading(false);
        return;
      }

      // If no bar exists, redirect to onboarding to create one first
      if (!hasBar) {
        router.push(`/onboarding?plan=${planKey}`);
        return;
      }

      const res = await fetch("/api/paypal/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId: ownerData.ownerId, planKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create subscription");
        setLoading(false);
        return;
      }

      // Redirect to PayPal approval URL
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      }
    } catch (err) {
      console.error("Subscription error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navigation />
        <main className="mx-auto max-w-2xl px-4 pb-16 pt-12 text-center">
          <p className="text-slate-300">Loading...</p>
        </main>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navigation />
        <main className="mx-auto max-w-2xl px-4 pb-16 pt-12 text-center">
          <p className="text-red-300">Invalid plan selected</p>
          <Link href="/pricing" className="mt-4 inline-flex text-emerald-200 hover:text-emerald-100">
            Back to pricing →
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-12">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Upgrade to {selectedPlan.name}</h1>
          <p className="text-sm text-slate-300">Complete your subscription setup</p>
        </header>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-700 pb-4">
              <span className="text-slate-200">Plan</span>
              <span className="font-semibold text-white">{selectedPlan.name}</span>
            </div>

            <div className="flex justify-between border-b border-slate-700 pb-4">
              <span className="text-slate-200">Price</span>
              <span className="font-semibold text-white">
                ${selectedPlan.price}/{selectedPlan.interval}
              </span>
            </div>

            <div className="flex justify-between pb-4">
              <span className="text-slate-200">Renewal</span>
              <span className="font-semibold text-white">
                {selectedPlan.interval === "month" ? "Monthly" : "Yearly"}
              </span>
            </div>

            {selectedPlan.id === "monthly" && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                <p className="text-sm text-emerald-100 font-semibold">30-day free trial</p>
                <p className="text-xs text-emerald-200/80 mt-1">
                  No charge today. Your card will auto-charge at the end of the free month unless you cancel.
                </p>
              </div>
            )}

            <div className="border-t border-slate-700 pt-4">
              <h3 className="mb-3 font-semibold text-white">Includes:</h3>
              <ul className="space-y-2">
                {selectedPlan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-emerald-300">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {!hasBar && (
              <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="text-sm text-amber-200">
                  <span className="font-semibold">Note:</span> You&apos;ll be taken to set up your bar profile next.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            onClick={handleCreateSubscription}
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? "Redirecting to PayPal..." : "Continue to PayPal"}
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            You will be redirected to PayPal to complete your payment securely.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-sm text-emerald-200 hover:text-emerald-100">
            ← Back to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>}>
      <SubscriptionContent />
    </Suspense>
  );
}
