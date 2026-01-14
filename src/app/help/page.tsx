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
      { question: "New bar setup", answer: "Create an owner/manager account, add your bar details (name, address, phone, hours), then publish at least one offering or event so patrons can find you." },
      { question: "Multiple locations", answer: "Add each location separately from the dashboard. Each has its own offerings, events, and analytics." },
      { question: "Keep visibility high", answer: "Publish recurring offerings (happy hour, trivia, karaoke) and keep times accurate. Fresh events surface better in search and on the map." },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard & Analytics",
    icon: "📊",
    content: [
      { question: "What you see", answer: "Search appearances, profile views, directions clicks, website taps, and top search terms by day/time." },
      { question: "Use the data", answer: "Fill slow days the heatmap exposes. Match events and specials to the top searched categories near you." },
      { question: "If numbers look low", answer: "Confirm your bar is published, has current offerings/events, and that your location is correct. Give new bars a little time to gather data." },
    ],
  },
  {
    id: "offerings",
    title: "Offerings & Events",
    icon: "🍹",
    content: [
      { question: "Offerings vs. events", answer: "Offerings are recurring (e.g., happy hour). Events are dated/one-time. Both show in search and on the map." },
      { question: "Best practices", answer: "Use clear titles (e.g., “Wing Wednesday”), include start/end times, and add a short description. Remove past items to keep your list clean." },
      { question: "Boosts (Premium)", answer: "Premium bars can boost events for extra visibility during chosen windows and see impressions/clicks in the dashboard." },
    ],
  },
  {
    id: "inventory",
    title: "Inventory & Operations",
    icon: "📦",
    content: [
      { question: "Inventory add-on", answer: "Enable the Inventory add-on to manage products, record counts, and generate low-stock and reorder lists." },
      { question: "Counting options", answer: "Manual counts for any item, quick packaged counts, and a photo-based liquor scan (AI-ready stub) where you confirm detected bottles." },
      { question: "Reorder signals", answer: "Set par and reorder thresholds on bar products to get an automatic low-stock list and exports." },
    ],
  },
  {
    id: "subscription",
    title: "Subscription & Billing",
    icon: "💳",
    content: [
      { question: "Plans", answer: "Free covers basic visibility. Pro/Premium unlock analytics, boosts, and advanced features. Inventory is a separate add-on." },
      { question: "Billing & upgrades", answer: "Manage subscriptions via PayPal. You can upgrade, downgrade, or cancel in PayPal at any time." },
      { question: "Trials and pauses", answer: "If a payment fails, the bar may be unpublished until resolved. Trials auto-convert unless cancelled in PayPal." },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting & Common Issues",
    icon: "🛠️",
    content: [
      { question: "Bar not in search", answer: "Ensure location is correct, the bar is published, and you have at least one current offering or event. Check subscription status." },
      { question: "Editing bar info", answer: "Owners/managers can edit address, phone, and details in the bar settings. Super Admin can also update or remove bars if needed." },
      { question: "Need help?", answer: "Use the Contact form or email coryarmer@gmail.com with your bar name, issue, and screenshots if possible." },
    ],
  },
  {
    id: "best-practices",
    title: "Best Practices & Tips",
    icon: "⭐",
    content: [
      { question: "Drive discovery", answer: "Publish clear, specific titles (e.g., “Karaoke Thursdays 8–11 PM”). Match to popular search terms in your area." },
      { question: "Event timing", answer: "Use analytics to fill slower days. Mid-week specials often lift traffic and repeat visits." },
      { question: "Promote check-ins", answer: "Display your QR code and offer a perk (e.g., 10% off) to encourage patrons to check in and follow your bar." },
    ],
  },
];

export default function HelpPage() {
  const [openId, setOpenId] = useState<string | null>(sections[0]?.id ?? null);
  const [modalId, setModalId] = useState<string | null>(null);

  const activeModal = sections.find((s) => s.id === modalId) || null;

  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <h1 className="text-3xl font-semibold mb-2">Everything you need to know about using BarLink to grow your bar business.</h1>
        <p className="text-slate-300 mb-6 text-sm">Tap a card to expand. Answers stay open for quick reference.</p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const isOpen = section.id === openId;
            return (
              <div
                key={section.id}
                className={`rounded-2xl border px-4 py-3 transition-all ${
                  isOpen
                    ? "border-cyan-300 bg-white/10 shadow-cyan-300/30 shadow-lg"
                    : "border-white/10 bg-white/5 hover:border-cyan-200/50 hover:bg-white/10"
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`${section.id}-content`}
                  onClick={() => setOpenId(isOpen ? null : section.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    <div>
                      <div className="text-base font-semibold text-white">{section.title}</div>
                      <div className="text-xs text-slate-300">{isOpen ? "Hide answers" : "Tap to view answers"}</div>
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div id={`${section.id}-content`} className="mt-3 space-y-3 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setModalId(section.id)}
                        className="rounded-full border border-cyan-300/60 px-3 py-1 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/10"
                      >
                        Open detailed guide
                      </button>
                    </div>
                    {section.content.slice(0, 2).map((item) => (
                      <div key={item.question} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="font-semibold text-white">{item.question}</div>
                        <div className="text-slate-200 mt-1 leading-relaxed">{item.answer}</div>
                      </div>
                    ))}
                    {section.content.length > 2 && (
                      <div className="text-xs text-slate-300">
                        More answers available in the detailed guide.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/15 bg-slate-900/95 p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-lg font-semibold text-white">
                    <span className="text-2xl">{activeModal.icon}</span>
                    <span>{activeModal.title}</span>
                  </div>
                  <p className="text-slate-300 text-sm mt-1">
                    Detailed guidance for {activeModal.title}. Use this to get set up or troubleshoot quickly.
                  </p>
                </div>
                <button
                  onClick={() => setModalId(null)}
                  className="rounded-full border border-white/20 px-3 py-1 text-sm text-slate-200 hover:bg-white/10"
                  aria-label="Close help details"
                >
                  Close
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {activeModal.content.map((item) => (
                  <div key={item.question} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="font-semibold text-white">{item.question}</div>
                    <div className="text-slate-200 mt-1 leading-relaxed">{item.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
