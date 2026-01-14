'use client';

import { useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "barlink_owner_tips_hidden";

type Tip = {
  title: string;
  description: string;
  href: string;
};

const TIPS: Tip[] = [
  {
    title: "Add events",
    description: "Create one-time or recurring events so patrons see what's happening.",
    href: "/dashboard", // choose a bar then Events
  },
  {
    title: "Add offerings",
    description: "Publish weekly offerings like trivia, karaoke, or happy hour specials.",
    href: "/dashboard", // choose a bar then Offerings
  },
  {
    title: "Inventory",
    description: "Track bottles and counts. Open your bar card, then Inventory.",
    href: "/dashboard",
  },
  {
    title: "QR check-ins",
    description: "Generate QR codes from your bar card to drive check-ins.",
    href: "/dashboard",
  },
];

export default function OwnerTips() {
  const [hidden, setHidden] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  if (hidden) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setHidden(true);
  };

  return (
    <div className="glass-panel rounded-3xl p-4 shadow-lg mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Quick tips</h2>
          <p className="text-sm text-slate-300">Highlights of key features for owners.</p>
        </div>
        <label className="text-xs text-slate-300 inline-flex items-center gap-1">
          <input type="checkbox" onChange={dismiss} className="h-3 w-3 accent-cyan-400" /> Do not show again
        </label>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {TIPS.map((tip) => (
          <Link
            key={tip.title}
            href={tip.href}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 transition-all hover:border-cyan-400/40 hover:bg-white/10"
          >
            <div className="text-sm font-semibold text-white">{tip.title}</div>
            <div className="text-xs text-slate-300 mt-1">{tip.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
