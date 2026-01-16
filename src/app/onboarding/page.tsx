"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Navigation from "@/components/Navigation";
import { SUBSCRIPTION_PLANS, US_STATES, BAR_TYPES } from "@/lib/constants";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  
  // Support both new signup (ownerId) and logged-in users (session)
  const ownerId = searchParams.get("ownerId");
  const isNewUser = !!ownerId;
  const planKey = searchParams.get("plan") || "monthly";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentOwnerId, setCurrentOwnerId] = useState(ownerId || "");

  // Bar profile fields
  const [barName, setBarName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [barType, setBarType] = useState("Unclassified");
  const [checkInReward, setCheckInReward] = useState("");

  useEffect(() => {
    // If new user signup flow, need ownerId
    if (isNewUser && !ownerId) {
      router.push("/auth/signup");
    }
    
    // If logged-in user, fetch their owner ID
    if (!isNewUser && status === "authenticated") {
      const fetchOwnerId = async () => {
        try {
          const res = await fetch("/api/auth/owner");
          const data = await res.json();
          if (data.ownerId) {
            setCurrentOwnerId(data.ownerId);
          }
        } catch (err) {
          console.error("Failed to fetch owner:", err);
        }
      };
      fetchOwnerId();
    }
    
    // If not logged in and not a new signup, redirect to pricing
    if (!isNewUser && status === "unauthenticated") {
      router.push("/pricing");
    }
  }, [ownerId, isNewUser, status, router]);

  const handleBarProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/bars/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: currentOwnerId,
          name: barName,
          address,
          city,
          state,
          zipCode,
          phone,
          website,
          description,
          barType,
          checkInReward,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create bar profile");
        setLoading(false);
        return;
      }

      // Move to subscription step
      setStep(2);
      setLoading(false);
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleSubscriptionSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/paypal/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId: currentOwnerId, planKey }),
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
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === planKey);

  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-12">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-gradient">Welcome to BarLink360</h1>
          <p className="text-sm text-slate-300">Complete setup in 2 steps</p>
        </header>

        <div className="mt-6 flex items-center justify-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 1 ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
            1
          </div>
          <div className="h-1 w-16 bg-slate-700"></div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 2 ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
            2
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleBarProfileSubmit} className="mt-8 space-y-4 glass-panel rounded-3xl p-6">
            <h2 className="text-xl font-semibold">Step 1: Create your bar profile</h2>

            <label className="block text-sm text-slate-200">
              Bar name *
              <input
                type="text"
                value={barName}
                onChange={(e) => setBarName(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                required
              />
            </label>

            <label className="block text-sm text-slate-200">
              Bar type
              <select
                value={barType}
                onChange={(e) => setBarType(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              >
                {BAR_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-slate-200">
              Check-in perk (optional)
              <input
                type="text"
                value={checkInReward}
                onChange={(e) => setCheckInReward(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                placeholder="e.g., 10% off when you check in via QR"
              />
            </label>

            <label className="block text-sm text-slate-200">
              Address *
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                required
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block text-sm text-slate-200">
                City *
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                  required
                />
              </label>
              <label className="block text-sm text-slate-200">
                State *
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                  required
                >
                  <option value="">Select</option>
                  {US_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-200">
                Zip code *
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                  required
                />
              </label>
            </div>

            <label className="block text-sm text-slate-200">
              Phone
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              />
            </label>

            <label className="block text-sm text-slate-200">
              Website
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              />
            </label>

            <label className="block text-sm text-slate-200">
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-white"
                rows={3}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary px-4 py-3 text-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : "Continue to subscription"}
            </button>
          </form>
        )}

        {step === 2 && selectedPlan && (
          <div className="mt-8 space-y-4 glass-panel rounded-3xl p-6">
            <h2 className="text-xl font-semibold">Step 2: Subscribe to activate</h2>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <h3 className="text-lg font-semibold text-white">{selectedPlan.name}</h3>
              <p className="text-2xl font-bold text-emerald-200">${selectedPlan.price}/{selectedPlan.interval}</p>
              <p className="text-sm text-slate-300">{selectedPlan.description}</p>
            </div>

            <p className="text-sm text-slate-300">
              You&apos;ll be redirected to PayPal to complete payment. Once activated, your bar will appear in patron searches.
            </p>

            <button
              onClick={handleSubscriptionSubmit}
              disabled={loading}
              className="w-full btn-primary px-4 py-3 text-sm disabled:opacity-50"
            >
              {loading ? "Redirecting..." : "Continue to PayPal"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen app-shell text-white flex items-center justify-center">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
