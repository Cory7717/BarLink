import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminRevenuePage() {
  const session = await auth();
  if (!session?.user?.email || session.user.email.toLowerCase() !== "coryarmer@gmail.com") {
    redirect("/admin");
  }

  const [activeSubs, proCount, premiumCount, addOnCount] = await Promise.all([
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.bar.count({ where: { subscriptionTier: "PRO" } }),
    prisma.bar.count({ where: { subscriptionTier: "PREMIUM" } }),
    prisma.bar.count({ where: { inventoryAddOnEnabled: true } }),
  ]);

  const mrrEstimate = proCount * 30 + premiumCount * 60 + addOnCount * 20;
  const arrEstimate = mrrEstimate * 12;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-gradient">Revenue Snapshot</h1>
      <p className="text-sm text-slate-300">Estimates based on tier counts (placeholder pricing).</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-slate-300 text-sm">Active subscriptions</div>
          <div className="text-3xl font-semibold text-white">{activeSubs}</div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-slate-300 text-sm">MRR (est)</div>
          <div className="text-3xl font-semibold text-white">${mrrEstimate.toFixed(0)}</div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-slate-300 text-sm">ARR (est)</div>
          <div className="text-3xl font-semibold text-white">${arrEstimate.toFixed(0)}</div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-slate-300 text-sm">Pro bars</div>
          <div className="text-3xl font-semibold text-white">{proCount}</div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-slate-300 text-sm">Premium bars</div>
          <div className="text-3xl font-semibold text-white">{premiumCount}</div>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-slate-300 text-sm">Inventory add-on</div>
          <div className="text-3xl font-semibold text-white">{addOnCount}</div>
        </div>
      </div>
    </div>
  );
}
