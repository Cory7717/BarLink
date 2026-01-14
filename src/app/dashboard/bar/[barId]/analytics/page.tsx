import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import Link from "next/link";

export default async function AnalyticsPage({ params }: { params: Promise<{ barId: string }> }) {
  const { barId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const bar = await prisma.bar.findUnique({
    where: { id: barId },
    select: {
      id: true,
      name: true,
      owner: { select: { email: true } },
      subscriptionTier: true,
      inventoryAddOnEnabled: true,
    },
  });

  if (!bar) redirect("/dashboard");
  if (bar.owner.email !== session.user.email) redirect("/dashboard");

  const isProOrPremium = bar.subscriptionTier === "PRO" || bar.subscriptionTier === "PREMIUM";

  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href={`/dashboard/bar/${bar.id}`} className="text-sm text-slate-400 hover:text-white mb-2 inline-block">
              Back to bar
            </Link>
            <h1 className="text-3xl font-semibold text-gradient">{bar.name} - Analytics & ROI</h1>
            <p className="text-sm text-slate-300 mt-1">
              Track searches → views → clicks → check-ins. Upgrade for full charts and exports.
            </p>
          </div>
          {!isProOrPremium && (
            <Link
              href="/dashboard/subscription?feature=analytics"
              className="btn-primary px-4 py-2 text-sm"
            >
              Upgrade to Pro/Premium
            </Link>
          )}
        </div>

        {!isProOrPremium && (
          <div className="rounded-3xl border border-amber-400/40 bg-amber-500/10 p-5">
            <h2 className="text-lg font-semibold text-white mb-2">Unlock full analytics</h2>
            <ul className="text-sm text-amber-100 space-y-1">
              <li>• Funnel: searches → profile views → directions/website clicks</li>
              <li>• Day/time heatmap for planning specials and events</li>
              <li>• Top searched categories near you with quick-add suggestions</li>
              <li>• Boost performance (Premium) with impressions/clicks reporting</li>
              <li>• Exports (CSV/PDF) for sharing with your team</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/dashboard/subscription?feature=analytics" className="btn-primary px-4 py-2 text-sm">
                See plans
              </Link>
              <Link href="/pricing" className="btn-secondary px-4 py-2 text-sm">
                View pricing page
              </Link>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">Highlights</h3>
            <p className="text-sm text-slate-300 mt-2">
              Daily searches, profile views, directions clicks, website taps, and QR check-ins.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                <div className="text-xs text-slate-400">Profile views (last 7d)</div>
                <div className="text-xl font-semibold text-white">—</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                <div className="text-xs text-slate-400">Directions clicks (7d)</div>
                <div className="text-xl font-semibold text-white">—</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                <div className="text-xs text-slate-400">Website taps (7d)</div>
                <div className="text-xl font-semibold text-white">—</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                <div className="text-xs text-slate-400">QR check-ins (7d)</div>
                <div className="text-xl font-semibold text-white">—</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">How to use</h3>
            <ul className="text-sm text-slate-200 space-y-2 mt-2">
              <li>• Add at least one current offering and event for visibility.</li>
              <li>• Watch the heatmap to fill weak days with specials.</li>
              <li>• Track conversions from searches to directions/website clicks.</li>
              <li>• Use boosts (Premium) for big nights and measure results.</li>
            </ul>
            <div className="mt-3">
              <Link href="/dashboard/subscription?feature=analytics" className="btn-secondary px-4 py-2 text-sm">
                Upgrade for full analytics
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
