import { auth } from "@/lib/auth";
import { getBaseUrl } from "@/lib/getBaseUrl";
import { redirect } from "next/navigation";

async function getSummary() {
  const base = getBaseUrl();
  try {
    const res = await fetch(`${base}/api/admin/system/summary`, { cache: "no-store" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to load system summary");
    }
    return res.json();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to load system summary" };
  }
}

export default async function SystemHealthPage() {
  const session = await auth();
  if (!session?.user?.email || session.user.email.toLowerCase() !== "coryarmer@gmail.com") {
    redirect("/admin");
  }

  const summary = await getSummary();

  if ("error" in summary) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-gradient">System health</h1>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {summary.error}
        </div>
      </div>
    );
  }

  const cards: { label: string; value: string | number }[] = [
    { label: "Bars", value: summary.barsCount },
    { label: "Owners", value: summary.ownersCount },
    { label: "Incomplete payments", value: summary.incompleteSubs },
    { label: "Past-due subs", value: summary.pastDueSubs },
    { label: "Trials ending (7d)", value: summary.trialsEnding },
    { label: "Open support tickets", value: summary.openTickets },
    { label: "Failed scans (7d)", value: summary.failedScans },
    { label: "Total scans (7d)", value: summary.totalScans },
    { label: "Scan failure rate", value: `${Math.round(summary.failureRate * 100)}%` },
    { label: "Idle bars 14d (no content)", value: summary.idleBars14d },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-gradient">System health</h1>
      <p className="text-sm text-slate-300">Operational signals across billing, support, and inventory.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="glass-panel rounded-2xl p-4">
            <div className="text-slate-300 text-sm">{c.label}</div>
            <div className="text-2xl font-semibold text-white">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-2">Alerts</h2>
        {summary.alerts && summary.alerts.length > 0 ? (
          <div className="space-y-2">
            {summary.alerts.map((a: any) => (
              <div key={`${a.label}-${a.value}`} className="flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2">
                <div className="text-sm text-amber-100">{a.label}</div>
                <div className="text-sm font-semibold text-amber-50">{a.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-300">No critical alerts.</p>
        )}
      </div>
    </div>
  );
}
