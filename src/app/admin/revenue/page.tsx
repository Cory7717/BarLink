import { auth } from "@/lib/auth";
import { getBaseUrl } from "@/lib/getBaseUrl";
import { redirect } from "next/navigation";

async function getSummary() {
  const base = getBaseUrl();
  try {
    const res = await fetch(`${base}/api/admin/revenue/summary`, { cache: "no-store" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to load revenue");
    }
    return res.json();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to load revenue" };
  }
}

export default async function AdminRevenuePage() {
  const session = await auth();
  if (!session?.user?.email || session.user.email.toLowerCase() !== "coryarmer@gmail.com") {
    redirect("/admin");
  }

  const summary = await getSummary();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-gradient">Revenue Snapshot</h1>
      <p className="text-sm text-slate-300">
        Live snapshot with estimates. Connect PayPal for actual MRR/ARR when ready.
      </p>

      {"error" in summary ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {summary.error}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label="Active subscriptions" value={summary.activeSubs} />
          <Metric label="Trialing" value={summary.trialingSubs} />
          <Metric label="Canceled" value={summary.canceledSubs} />
          <Metric label="MRR (est)" value={`$${summary.mrrEstimate.toFixed(0)}`} />
          <Metric label="ARR (est)" value={`$${summary.arrEstimate.toFixed(0)}`} />
          <Metric label="ARPU (est)" value={`$${summary.arpuEstimate.toFixed(2)}`} />
          <Metric label="Pro bars" value={summary.proBars} />
          <Metric label="Premium bars" value={summary.premiumBars} />
          <Metric label="Inventory add-on" value={summary.addOnBars} />
          <Metric label="Boosts active" value={summary.boostsActive} />
          <Metric label="Boosts pending" value={summary.boostsPending} />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="text-slate-300 text-sm">{label}</div>
      <div className="text-3xl font-semibold text-white">{value}</div>
    </div>
  );
}
