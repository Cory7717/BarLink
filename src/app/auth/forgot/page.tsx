"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/owner/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Unable to send reset link.");
        return;
      }
      setStatus("sent");
      setMessage(data.message || "Reset link sent.");
    } catch {
      setStatus("error");
      setMessage("Unable to send reset link.");
    }
  };

  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="mx-auto max-w-md px-4 pb-16 pt-12">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-gradient">Reset your password</h1>
          <p className="text-sm text-slate-200">
            Enter the email tied to your owner account.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 glass-panel rounded-3xl p-6 shadow-lg">
          {message && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                status === "error"
                  ? "border-red-500/30 bg-red-500/10 text-red-100"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
              }`}
            >
              {message}
            </div>
          )}

          <label className="block text-sm text-slate-100">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30 transition-all"
              required
            />
          </label>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full btn-primary px-4 py-3 text-sm disabled:opacity-50"
          >
            {status === "loading" ? "Sending..." : "Send reset link"}
          </button>

          <p className="text-center text-sm text-slate-300">
            Remember your password?{" "}
            <Link href="/auth/signin" className="text-cyan-200 hover:text-cyan-100 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
