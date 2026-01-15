import { auth } from "@/lib/auth";
import { getBaseUrl } from "@/lib/getBaseUrl";
import { redirect } from "next/navigation";

async function getSummary() {
  const base = getBaseUrl();
  try {
    const res = await fetch(`${base}/api/admin/marketing/summary`, { cache: "no-store" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to load marketing data");
    }
    return res.json();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to load marketing data" };
  }
}

export default async function MarketingPage() {
  const session = await auth();
  if (!session?.user?.email || session.user.email.toLowerCase() !== "coryarmer@gmail.com") {
    redirect("/admin");
  }

  const summary = await getSummary();

  if ("error" in summary) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-gradient">Marketing & Growth</h1>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {summary.error}
        </div>
      </div>
    );
  }

  const cards: { label: string; value: string | number }[] = [
    { label: "Promo redemptions (30d)", value: summary.promoRedemptions },
    { label: "Unique promo codes (30d)", value: summary.uniqueCodes },
    { label: "New bars (30d)", value: summary.newBars30d },
    { label: "Followers (all time)", value: summary.followers },
    { label: "Events scheduled (30d)", value: summary.events30d },
    { label: "Top city (searches)", value: summary.topCity ? `${summary.topCity.city} (${summary.topCity.count})` : "-" },
    { label: "Top category (searches)", value: summary.topCategory ? `${summary.topCategory.category} (${summary.topCategory.count})` : "-" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-gradient">Marketing & Growth</h1>
      <p className="text-sm text-slate-300">High-level growth signals for campaigns and adoption.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="glass-panel rounded-2xl p-4">
            <div className="text-slate-300 text-sm">{c.label}</div>
            <div className="text-2xl font-semibold text-white">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
