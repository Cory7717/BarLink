'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'barlink-beta-modal-dismissed';

export default function BetaModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, '1');
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-emerald-400/40 bg-slate-900/95 p-6 shadow-2xl">
        <button
          aria-label="Close beta notice"
          className="absolute right-3 top-3 rounded-md px-2 py-1 text-sm text-slate-300 hover:text-white hover:bg-white/10"
          onClick={dismiss}
        >
          ✕
        </button>

        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/50">
            🚀 Beta Launch
          </span>
          <h2 className="text-2xl font-bold text-white">Welcome to BarPulse (Beta)</h2>
          <p className="text-sm text-slate-200 leading-relaxed">
            We&apos;re rolling out with our early partners. The first 50 owners who pick the monthly plan get a free 30-day trial—no charge until after your trial ends.
          </p>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
            <p>What to do next:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-slate-200/90">
              <li>Pick the Monthly plan to lock in the free 30-day trial.</li>
              <li>Create your bar profile so patrons can find you.</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/pricing"
              className="inline-flex justify-center rounded-lg bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-slate-950 hover:from-emerald-400 hover:to-emerald-500 transition-all"
              onClick={dismiss}
            >
              See pricing
            </Link>
            <button
              className="inline-flex justify-center rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-all"
              onClick={dismiss}
            >
              Remind me later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
