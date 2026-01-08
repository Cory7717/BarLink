"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";

interface Section {
  id: string;
  title: string;
  icon: string;
  content: Array<{
    question: string;
    answer: string;
  }>;
}

const helpSections: Section[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "🚀",
    content: [
      {
        question: "What is BarPulse and how does it help my bar?",
        answer:
          "BarPulse is a bar discovery platform that connects bar owners with customers actively looking for bars in their area. Bar owners can list their offerings (happy hour, trivia, karaoke, live music) and event schedules. Customers search for these specific offerings by day and time. This helps you attract more foot traffic by making it easy for people to find exactly what they're looking for at your bar.",
      },
      {
        question: "How do I get started with BarPulse?",
        answer:
          "1. Sign up for an account at barlink.com/auth/signup. 2. Add your first bar location with basic info (name, address, city, state). 3. Subscribe to a plan (monthly or annual). 4. Set up your offerings (happy hour times, events like trivia/karaoke). 5. Start receiving customer visits tracked on your dashboard!",
      },
      {
        question: "What's the difference between Free and Premium plans?",
        answer:
          "Free plan: Limited to 1 bar location, basic analytics. Premium plan ($29/month): Unlimited locations with per-location licensing, advanced analytics, inventory tracking, revenue insights. Free trial included for first month.",
      },
      {
        question: "How do I add multiple locations?",
        answer:
          "From your Dashboard, click 'Add location'. Each location requires its own BarPulse license ($29/month per location). Each bar can have independent offerings, events, and analytics. Multi-location managers can track all bars from one account.",
      },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard & Analytics",
    icon: "📊",
    content: [
      {
        question: "What metrics does the dashboard show?",
        answer:
          "Profile Views: How many customers viewed your bar's profile. Profile Clicks: How many customers clicked through to learn more. Search Appearances: How often your bar appeared in customer searches. Conversion Rate: The percentage of views that resulted in a click or visit.",
      },
      {
        question: "How is activity tracked by day of week?",
        answer:
          "BarPulse tracks which days of the week are busiest for your bar. It breaks down traffic by source: Search (customers searching for specific offerings), Map (location-based discovery), Favorites (customers who saved your bar), Direct (customers visiting directly). This helps you identify patterns and schedule events strategically.",
      },
      {
        question: "What are 'Top Search Queries'?",
        answer:
          "This shows the keywords customers are searching for when they find your bar. For example, if 'trivia' is a top query, it means many customers discover you through trivia searches. Use this data to prioritize which offerings to promote and schedule.",
      },
      {
        question: "How do I use insights and recommendations?",
        answer:
          "BarPulse automatically generates personalized recommendations based on your analytics. It suggests days to promote when engagement is low, highlights your best performing day for scheduling special events, and recommends which offerings to emphasize based on search trends.",
      },
      {
        question: "Can I change the timeframe for analytics?",
        answer:
          "Yes. On the analytics dashboard, you can view data for the Last 7 days, Last 30 days, or Last 90 days. This helps you see short-term trends, monthly patterns, or long-term growth.",
      },
    ],
  },
  {
    id: "offerings",
    title: "Offerings & Events",
    icon: "🍹",
    content: [
      {
        question: "What's the difference between Offerings and Events?",
        answer:
          "Offerings are recurring items you have regularly (Happy Hour 4-6pm Mon-Fri, Trivia every Tuesday at 7pm). Events are one-time or special occasions (Live band December 20th, Holiday party). Both help customers find what they're looking for.",
      },
      {
        question: "How do I create an offering?",
        answer:
          "From your bar's Manage page, click 'Add Offering'. Fill in: Name (e.g., Happy Hour, Karaoke Night), Description, Days of week it runs, Start and end times, and any special details. Save and it will appear in customer searches.",
      },
      {
        question: "What offerings get the most visibility?",
        answer:
          "Popular offerings include: Happy Hour (time-sensitive, high traffic), Trivia Nights (recurring, dedicated audience), Live Music (draws crowds), Karaoke (entertainment value), Wings/Food Specials (promotions), Drink Specials. Check your Top Search Queries to see what customers are looking for.",
      },
      {
        question: "How often should I update my offerings?",
        answer:
          "Keep offerings current as your schedule changes. If you cancel a weekly trivia night or change happy hour times, update immediately so customers see accurate info. Check your analytics weekly to see which offerings drive the most traffic and consider adding more of those.",
      },
      {
        question: "Can I schedule events in advance?",
        answer:
          "Yes. Events can be created for upcoming dates. This gives customers advance notice of special events like live bands, happy hour extensions, or holiday parties. Events appear prominently in search results near their date.",
      },
    ],
  },
  {
    id: "inventory",
    title: "Inventory & Operations",
    icon: "📦",
    content: [
      {
        question: "What is Inventory Tracking?",
        answer:
          "Inventory tracking helps you monitor bottle stock and usage across shifts. Import your inventory list, record usage at the end of each shift, and take physical inventory snapshots to track variances. This helps identify over-pouring, waste, or theft.",
      },
      {
        question: "How do I import my inventory?",
        answer:
          "From your Inventory dashboard, click 'Import Inventory'. Download the template CSV file, fill in your bottles with cost and category, upload it back. Your inventory catalog will be set up and ready to track usage.",
      },
      {
        question: "How do I record shift usage?",
        answer:
          "At the end of each shift, go to 'Record Shift Usage'. Select the date and shift, then mark how many of each bottle type was used. This builds a usage history and helps calculate pour costs.",
      },
      {
        question: "What's a physical inventory snapshot?",
        answer:
          "A snapshot is a physical count of bottles at a specific time (end of week/month). Go to 'Inventory Snapshots' and enter actual bottle counts. BarPulse compares this to expected inventory based on usage records to identify variance and help prevent shrinkage.",
      },
      {
        question: "How does variance tracking help?",
        answer:
          "If expected usage (based on recorded shifts) doesn't match actual inventory counts, BarPulse alerts you. Large variances could indicate over-pouring, waste, spillage, or theft. Use this data to train staff, adjust portions, or investigate discrepancies.",
      },
    ],
  },
  {
    id: "subscription",
    title: "Subscription & Billing",
    icon: "💳",
    content: [
      {
        question: "How much does BarPulse cost?",
        answer:
          "Starter: Free forever (1 bar, basic analytics). Premium: $29/month per bar location. Billed through PayPal. Cancel anytime. First month free for new Premium subscribers.",
      },
      {
        question: "How do per-location licenses work?",
        answer:
          "Each bar location needs its own license ($29/month). If you have 3 bars, you pay $87/month total. Each location gets independent analytics, offerings, events, and inventory tracking. All managed from one account.",
      },
      {
        question: "Can I change my subscription plan?",
        answer:
          "Yes. From your Dashboard, go to Subscription section. You can upgrade, downgrade, or cancel anytime. Changes take effect at your next billing cycle.",
      },
      {
        question: "How do I manage my PayPal billing?",
        answer:
          "From Dashboard > Subscription, click 'Manage billing on PayPal'. This opens your PayPal subscription management where you can update payment method, cancel, or view billing history.",
      },
      {
        question: "What happens if my subscription expires?",
        answer:
          "If payment fails or subscription expires, your bar will be marked as PAST_DUE or UNLICENSED. It will no longer appear in customer searches. Renew your subscription to restore visibility.",
      },
      {
        question: "Is there a discount for annual billing?",
        answer:
          "Check the Pricing page for current promotions. Annual plans often include discounts compared to monthly billing.",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting & Common Issues",
    icon: "🔧",
    content: [
      {
        question: "My bar isn't appearing in search results. What's wrong?",
        answer:
          "Check: 1) Is your subscription active? (Dashboard > Subscription). 2) Have you added offerings/events? Bars with no offerings don't appear in searches. 3) Are your offerings' times set correctly? Past-due offerings won't show. 4) Is your location info complete (address, city, state)?",
      },
      {
        question: "I updated my hours but they're not showing. Why?",
        answer:
          "Changes can take up to 5 minutes to appear in search results. Try refreshing your browser. If still not showing, verify the offering is saved correctly and the time is in the future (past offerings hide automatically).",
      },
      {
        question: "The analytics show zero views. What should I do?",
        answer:
          "1) Check timeframe - are you looking at Last 7 days? 2) Verify subscription is ACTIVE (bars on free plan have limited visibility). 3) Make sure you have offerings listed (required for search visibility). 4) If new, give it a few days for customers to discover you. 5) Promote your bar on social media to drive traffic.",
      },
      {
        question: "I can't sign in to my account. What should I do?",
        answer:
          "1) Double-check your email address and password. 2) Try 'Forgot Password' to reset. 3) Make sure you're using the same email you signed up with. 4) Clear browser cache and try again. 5) Try a different browser. If still stuck, contact support.",
      },
      {
        question: "I'm getting a 'server error' when accessing my dashboard.",
        answer:
          "This usually means a temporary issue. Try: 1) Refresh the page. 2) Wait 5 minutes and try again. 3) Clear browser cache. 4) Try incognito/private browsing. 5) Use a different browser. If error persists, contact support with the error code shown.",
      },
      {
        question: "Inventory numbers don't match my physical count. Why?",
        answer:
          "Possible causes: 1) Usage wasn't recorded for all shifts. 2) Spillage/breakage wasn't logged. 3) New inventory wasn't added to the import. 4) Staff over/under-pouring compared to standard portions. Review usage logs and retrain staff on portion sizes if needed.",
      },
      {
        question: "How do I contact support if I need more help?",
        answer:
          "Email support@barpulse.com with details about your issue. Include: your bar name, email, what you were trying to do, and any error messages. Support responds within 24 hours.",
      },
    ],
  },
  {
    id: "best-practices",
    title: "Best Practices & Tips",
    icon: "⭐",
    content: [
      {
        question: "How do I maximize customer discovery?",
        answer:
          "1) Add multiple offerings across different times (weekday happy hour, weekend events). 2) Keep offerings updated - remove past items, add seasonal specials. 3) Use specific keywords (e.g., 'Wing Wednesdays' instead of just 'specials'). 4) Check Top Search Queries and emphasize those offerings. 5) Promote via social media and link to your BarPulse profile.",
      },
      {
        question: "What offerings should I prioritize?",
        answer:
          "Start with offerings that are unique to your bar or fill a time slot with low traffic. Happy Hour is almost always valuable during weekday 4-6pm. Check competitor offerings to differentiate. Use analytics to see which offerings generate the most views and clicks, then expand those.",
      },
      {
        question: "When should I schedule events?",
        answer:
          "Schedule events for times when your bar is typically slow or when an event can draw extra crowds. Friday and Saturday nights are premium. Mid-week events (Tue-Thu) can boost slow nights. Check your 'Best Performing Days' analytics to align events with naturally busy times.",
      },
      {
        question: "How often should I check my analytics?",
        answer:
          "Check weekly minimum to monitor trends and adjust offerings. If you see a big drop in traffic, investigate why. Use insights to schedule promotions on slow days. Monthly review helps identify seasonal patterns.",
      },
      {
        question: "How can I reduce inventory variance?",
        answer:
          "1) Train staff on standard pour sizes. 2) Do physical counts weekly (not monthly) to catch issues faster. 3) Use the variance alerts to flag discrepancies immediately. 4) Review high-variance bottles - are they being over-poured or wasted? 5) Consider using pour counters for premium bottles.",
      },
      {
        question: "Should I offer online reservations or ordering?",
        answer:
          "BarPulse is discovery-focused (customers find your bar and its offerings). For reservations/ordering, integrate with platforms like OpenTable or Toast. BarPulse helps get people in the door; other tools help with booking and orders.",
      },
    ],
  },
];

export default function HelpPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>("getting-started");
  const [expandedQA, setExpandedQA] = useState<Record<string, boolean>>({});

  const toggleQA = (id: string) => {
    setExpandedQA((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 text-white">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent mb-2">
            Help & Support
          </h1>
          <p className="text-slate-300">
            Everything you need to know about using BarPulse to grow your bar business.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mb-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {helpSections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setExpandedSection(expandedSection === section.id ? null : section.id);
                setExpandedQA({});
              }}
              className={`rounded-lg border p-4 text-left transition-all ${
                expandedSection === section.id
                  ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/20"
                  : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50"
              }`}
            >
              <span className="text-2xl">{section.icon}</span>
              <p className="mt-2 font-semibold">{section.title}</p>
            </button>
          ))}
        </div>

        {/* Expanded Content */}
        {expandedSection && (
          <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-8 shadow-lg">
            {helpSections
              .filter((s) => s.id === expandedSection)
              .map((section) => (
                <div key={section.id}>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    {section.icon} {section.title}
                  </h2>
                  <div className="space-y-4">
                    {section.content.map((qa, idx) => {
                      const qaId = `${section.id}-${idx}`;
                      const isExpanded = expandedQA[qaId];
                      return (
                        <div
                          key={qaId}
                          className="rounded-lg border border-slate-700/30 bg-slate-900/50 overflow-hidden transition-all"
                        >
                          <button
                            onClick={() => toggleQA(qaId)}
                            className="w-full flex items-start justify-between p-4 text-left hover:bg-slate-800/50 transition-colors"
                          >
                            <h3 className="font-semibold text-slate-100 pr-4">{qa.question}</h3>
                            <span className="text-emerald-400 text-xl flex-shrink-0">
                              {isExpanded ? "−" : "+"}
                            </span>
                          </button>
                          {isExpanded && (
                            <div className="border-t border-slate-700/30 px-4 py-4 bg-slate-900/30 text-slate-300 text-sm leading-relaxed">
                              {qa.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-12 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Still need help?</h2>
          <p className="text-slate-300 mb-6">
            Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a
              href="mailto:support@barpulse.com"
              className="rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-600 px-6 py-3 font-semibold text-slate-950 hover:from-emerald-300 hover:to-emerald-500 transition-all"
            >
              📧 Email Support
            </a>
            <Link
              href="/contact"
              className="rounded-lg border border-slate-600 bg-slate-800/50 px-6 py-3 font-semibold text-white hover:bg-slate-700 transition-all"
            >
              💬 Contact Form
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
