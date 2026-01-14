"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";

type QA = { question: string; answer: string };
type Section = { id: string; title: string; icon: string; content: QA[] };

const sections: Section[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "🚀",
    content: [
      { question: "What is BarLink?", answer: "BarLink helps patrons find bars by day, activity, and offers. Owners publish offerings/events and appear in searches and on the live map." },
      { question: "How do I set up my bar?", answer: "Sign up, add your bar details, pick a plan, then add offerings (happy hour, trivia, karaoke) and events. Keep them current for visibility." },
      { question: "Multiple locations?", answer: "Add each location from the dashboard. Each bar has its own offerings/events and analytics." },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard & Analytics",
    icon: "📊",
    content: [
      { question: "What metrics do I see?", answer: "Search appearances, profile views, directions clicks, and top search queries by day/time." },
      { question: "Top searches?", answer: "Shows categories/keywords patrons use to find you. Use it to decide which offerings/events to run." },
      { question: "Slow days?", answer: "Use the heatmap to find weak days and schedule specials or events there." },
    ],
  },
  {
    id: "offerings",
    title: "Offerings & Events",
    icon: "🎟️",
    content: [
      { question: "Offerings vs Events?", answer: "Offerings are recurring (happy hour, trivia). Events are one-time or dated specials. Both surface in search." },
      { question: "What performs best?", answer: "Happy Hour, Trivia, Karaoke, Live Music, Food/Drink specials. Use clear titles and times." },
      { question: "Keep it updated", answer: "Remove past items, add seasonal specials, and set correct times/days for best visibility." },
    ],
  },
  {
    id: "inventory",
    title: "Inventory & Operations",
    icon: "📦",
    content: [
      { question: "Inventory basics", answer: "Manage products, record counts, and track low-stock items. Inventory add-on required." },
      { question: "Check-in perk", answer: "Offer a perk (e.g., 10% off) for QR check-ins to drive engagement." },
      { question: "Low-stock alerts", answer: "Set par and reorder thresholds on products to generate reorder lists." },
    ],
  },
  {
    id: "subscription",
    title: "Subscription & Billing",
    icon: "💳",
    content: [
      { question: "Plans", answer: "Free: basic visibility. Pro/Premium: advanced analytics, boosts, and more. Inventory add-on is separate." },
      { question: "Billing", answer: "Manage via PayPal. Update payment methods or cancel anytime." },
      { question: "If payment fails", answer: "Bar may be unpublished until resolved. Update billing in PayPal or switch plans." },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting & Common Issues",
    icon: "🛠️",
    content: [
      { question: "Bar not in search", answer: "Check subscription status, ensure offerings/events exist and are current, and confirm location data." },
      { question: "Analytics empty", answer: "New bar? Give it time. Ensure offerings exist and subscription is active. Check date range." },
      { question: "Need help?", answer: "Email coryarmer@gmail.com with your bar name, issue, and screenshots if possible." },
    ],
  },
  {
    id: "best-practices",
    title: "Best Practices & Tips",
    icon: "⭐",
    content: [
      { question: "Drive discovery", answer: "Use specific titles (e.g., Wing Wednesday), add multiple time slots, and align with top searches." },
      { question: "Event timing", answer: "Fill slower days; mid-week events can lift traffic. Promote best-performing categories from analytics." },
      { question: "Promote check-ins", answer: "Display QR codes and offer a perk to encourage patrons to check in." },
    ],
  },
];

export default function HelpPage() {
  const [activeId, setActiveId] = useState<string>(sections[0].id);
  const active = sections.find((s) => s.id === activeId) || sections[0];

  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <h1 className="text-3xl font-semibold mb-3">Everything you need to know about using BarLink to grow your bar business.</h1>
        <p className="text-slate-300 mb-6">Tap a card to view answers.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => {
            const isActive = section.id === activeId;
            return (
              <button
                key={section.id}
                onClick={() => setActiveId(section.id)}
                className={`text-left rounded-2xl border px-4 py-3 transition-all ${
                  isActive
                    ? "border-cyan-300 bg-white/10 shadow-cyan-300/30 shadow-lg"
                    : "border-white/10 bg-white/5 hover:border-cyan-200/50 hover:bg-white/10"
                }`}
              >
                <div className="text-2xl">{section.icon}</div>
                <div className="mt-2 text-base font-semibold text-white">{section.title}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 glass-panel rounded-3xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-3">{active.title}</h2>
          <div className="space-y-4">
            {active.content.map((item) => (
              <div key={item.question} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="text-sm font-semibold text-white">{item.question}</div>
                <div className="text-sm text-slate-200 mt-1">{item.answer}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
