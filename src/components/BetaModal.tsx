'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import styles from './percent.module.css';

const STORAGE_KEY = 'BarLink360-beta-modal-dismissed';

export default function BetaModal() {
  const [open, setOpen] = useState(false);
  const [signupsCount, setSignupsCount] = useState(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    // Check if dismissed, then show modal via callback
    const dismissed = typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY);
    
    // Use queueMicrotask to avoid synchronous setState warning
    if (!dismissed) {
      queueMicrotask(() => {
        setOpen(true);
      });
    }

    // Fetch signup count
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/admin/signup-count');
        if (res.ok) {
          const data = await res.json();
          setSignupsCount(data.count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch signup count:', error);
      }
    };

    fetchCount();
  }, []);

  const dismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, '1');
    }
    setOpen(false);
  };

  if (!open) return null;

  const spotsRemaining = Math.max(0, 50 - signupsCount);
  const isFull = spotsRemaining === 0;

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

        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/50">
            🚀 Beta Launch
          </span>
          <h2 className="text-2xl font-bold text-white">Welcome to BarLink360</h2>
          <p className="text-sm text-slate-200 leading-relaxed">
            We&apos;re launching with early access. The first <span className="font-semibold text-emerald-100">50 bar owners</span> who select the monthly plan get a full <span className="font-semibold text-emerald-100">30-day free trial</span>—no charge to start.
          </p>

          {/* Spots tracker */}
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Spots Remaining</span>
              <span className={`text-sm font-bold ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>
                {spotsRemaining}/50
              </span>
            </div>
            <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isFull ? 'bg-red-500' : 'bg-linear-to-r from-emerald-400 to-emerald-500'
                } ${styles['wPct' + Math.max(0, Math.min(100, Math.round(((50 - spotsRemaining) / 50) * 100))).toString()]}`}
              />
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
            <p className="font-semibold mb-2">What&apos;s included:</p>
            <ul className="space-y-1 text-slate-300/90">
              <li>✓ 30-day free trial (no card needed to start)</li>
              <li>✓ Full feature access during trial period</li>
              <li>✓ Priority email support</li>
              <li>✓ Auto-charges $30/mo after trial (cancel anytime)</li>
              <li>✓ Trial-end reminder before billing</li>
            </ul>
          </div>

          <div className="space-y-2">
            {!isFull ? (
              <>
                <Link
                  href="/pricing"
                  onClick={dismiss}
                  className="block rounded-lg bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-slate-950 hover:from-emerald-400 hover:to-emerald-500 transition-all hover:shadow-lg hover:shadow-emerald-500/30"
                >
                  Claim Your Free Trial →
                </Link>
                <p className="text-xs text-slate-400 text-center">
                  Limited to first 50 signups
                </p>
              </>
            ) : (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-center">
                <p className="text-sm font-semibold text-red-200">All 50 spots claimed!</p>
                <p className="text-xs text-red-200/70 mt-1">Join our waitlist for the next wave</p>
              </div>
            )}

            <button
              onClick={dismiss}
              className="w-full rounded-lg border border-slate-600/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-all"
            >
              Explore as Guest
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 mt-3">
            No credit card required. No long-term commitment. We&apos;ll remind you before billing starts.
          </p>
        </div>
      </div>
    </div>
  );
}
