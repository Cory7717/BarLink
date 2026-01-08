"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import Link from "next/link";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planFromUrl = searchParams.get("plan") || "monthly";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/owner/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      // Redirect to onboarding with owner ID and selected plan
      router.push(`/onboarding?ownerId=${data.ownerId}&plan=${planFromUrl}`);
    } catch {
      setError("Failed to create account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 text-white">
      <Navigation />
      <main className="mx-auto max-w-md px-4 pb-16 pt-12">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">Create Owner Account</h1>
          <p className="text-sm text-slate-200">Get started with BarPulse</p>
        </header>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <label className="block text-sm text-slate-100">
            Full name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-3 py-2 text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              required
            />
          </label>

          <label className="block text-sm text-slate-100">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-3 py-2 text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              required
            />
          </label>

          <label className="block text-sm text-slate-100">
            Phone (optional)
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-3 py-2 text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </label>

          <label className="block text-sm text-slate-100">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm px-3 py-2 text-white placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              minLength={8}
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-slate-300">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-emerald-300 hover:text-emerald-100 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 text-white flex items-center justify-center">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
