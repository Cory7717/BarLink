import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import ROIDashboard from "@/components/ROIDashboard";
import BarQRCode from "@/components/BarQRCode";
import { BadgeShowcase, BadgeGrid, BadgeProgress } from "@/components/BadgeDisplay";
import { BadgeService } from "@/lib/badgeService";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const owner = await prisma.owner.findUnique({
    where: { email: session.user.email! },
    include: {
      subscription: true,
      bars: {
        include: {
          offerings: true,
          events: true,
          barLicenses: true,
        },
      },
    },
  });

  if (!owner) {
    redirect("/auth/signup");
  }

  const hasActiveSubscription =
    owner.subscription?.status === "ACTIVE" || owner.allowFreeListings;
  const bars = owner.bars;
  const primaryBar = bars[0];

  let badges: Awaited<ReturnType<typeof BadgeService.getBarBadges>> = [];
  let badgeProgress: Awaited<ReturnType<typeof BadgeService.getBadgeProgress>> = [];

  if (primaryBar) {
    badges = await BadgeService.getBarBadges(primaryBar.id);
    badgeProgress = await BadgeService.getBadgeProgress(primaryBar.id);
  }

  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gradient">Dashboard</h1>
            <p className="text-sm text-slate-200">Welcome back, {owner.name}</p>
          </div>
          <Link href="/dashboard/settings" className="btn-secondary px-4 py-2 text-sm">
            Settings
          </Link>
        </header>

        {!hasActiveSubscription && (
          <div className="mt-6 glass-panel rounded-3xl p-4">
            <h3 className="font-semibold text-amber-50">Subscription required</h3>
            <p className="text-sm text-amber-100">
              Your bar will not appear in searches until you have an active subscription.
            </p>
            <Link href="/pricing" className="mt-2 inline-flex text-sm font-semibold text-amber-100 hover:text-white transition-colors">
              View plans
            </Link>
          </div>
        )}
        {owner.allowFreeListings && !owner.subscription && (
          <div className="mt-6 glass-panel rounded-3xl p-4">
            <h3 className="font-semibold text-emerald-100">Free listing enabled</h3>
            <p className="text-sm text-slate-200">
              This owner can publish listings without an active subscription.
            </p>
          </div>
        )}

        {owner.subscription && (
          <section className="mt-6 glass-panel rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white">Subscription</h2>
            <div className="mt-3 flex items-center gap-3">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  owner.subscription.status === "ACTIVE"
                    ? "bg-emerald-500/20 text-emerald-100"
                    : "bg-red-500/20 text-red-100"
                }`}
              >
                {owner.subscription.status}
              </span>
              <span className="text-sm text-slate-300">
                {owner.subscription.plan.replace("_", " ")} plan
              </span>
            </div>
            {owner.subscription.currentPeriodEnd && (
              <p className="mt-2 text-sm text-slate-400">
                {owner.subscription.status === "ACTIVE" ? "Renews" : "Expired"} on{" "}
                {new Date(owner.subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
            <a
              href="https://www.paypal.com/myaccount/autopay"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-sm font-semibold text-cyan-200 hover:text-cyan-100"
            >
              Manage billing on PayPal
            </a>
          </section>
        )}

        {bars.length > 0 && (
          <section className="mt-6 glass-panel rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Locations</h2>
                <p className="text-sm text-slate-300">Manage each bar and its per-location license.</p>
              </div>
              <Link href="/onboarding" className="btn-primary px-4 py-2 text-sm">
                Add location
              </Link>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {bars.map((b) => {
                const license = b.barLicenses?.[0];
                return (
                  <div key={b.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{b.name}</h3>
                        <p className="text-xs text-slate-300">
                          {b.city}, {b.state}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold rounded-full px-3 py-1 ${
                          license?.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-100"
                            : license?.status === "PAST_DUE"
                            ? "bg-amber-500/20 text-amber-100"
                            : "bg-slate-600/40 text-slate-200"
                        }`}
                      >
                        {license?.status ?? "UNLICENSED"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-300">
                      <span>{b.offerings.length} offerings</span>
                      <span>•</span>
                      <span>{b.events.length} events</span>
                      <span>•</span>
                      <span>{b.profileViews} views</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/dashboard/bar/${b.id}`} className="btn-secondary px-3 py-2 text-xs">
                        Manage
                      </Link>
                      <Link href={`/dashboard/bar/${b.id}/inventory`} className="btn-secondary px-3 py-2 text-xs">
                        Inventory
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {primaryBar ? (
          <section className="mt-6 glass-panel rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">{primaryBar.name}</h2>
                <p className="text-sm text-slate-200">
                  {primaryBar.address}, {primaryBar.city}, {primaryBar.state}
                </p>
                <div className="mt-2 flex gap-3 text-sm text-slate-300">
                  <span>{primaryBar.offerings.length} offerings</span>
                  <span>•</span>
                  <span>{primaryBar.events.length} events</span>
                  <span>•</span>
                  <span>{primaryBar.profileViews} views</span>
                </div>
                {badges.length > 0 && (
                  <div className="mt-3">
                    <BadgeShowcase badges={badges} limit={3} />
                  </div>
                )}
              </div>
              <Link href={`/dashboard/bar/${primaryBar.id}`} className="btn-primary px-4 py-2 text-sm">
                Manage bar
              </Link>
            </div>
          </section>
        ) : (
          <div className="mt-6 glass-panel rounded-3xl p-6 text-center shadow-lg">
            <p className="text-slate-200">You have not created a bar profile yet.</p>
            <Link href="/onboarding" className="mt-3 inline-flex btn-primary px-4 py-2 text-sm">
              Create bar profile
            </Link>
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="glass-panel rounded-2xl p-4">
            <h3 className="text-sm text-cyan-200">Profile views</h3>
            <p className="text-2xl font-semibold text-white">{primaryBar?.profileViews || 0}</p>
          </div>
          <div className="glass-panel rounded-2xl p-4">
            <h3 className="text-sm text-cyan-200">Search appearances</h3>
            <p className="text-2xl font-semibold text-white">{primaryBar?.searchAppearances || 0}</p>
          </div>
          <div className="glass-panel rounded-2xl p-4">
            <h3 className="text-sm text-cyan-200">Status</h3>
            <p className="text-lg font-semibold">
              {primaryBar?.isPublished || owner.allowFreeListings ? (
                <span className="text-emerald-100">Live</span>
              ) : (
                <span className="text-amber-100">Unpublished</span>
              )}
            </p>
          </div>
        </section>

        {primaryBar && badges.length > 0 && (
          <section className="mt-6 glass-panel rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Your badges</h2>
            <BadgeGrid badges={badges} />
          </section>
        )}

        {primaryBar && badgeProgress.length > 0 && (
          <section className="mt-6 glass-panel rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Badge progress</h2>
            <BadgeProgress progress={badgeProgress} limit={5} />
          </section>
        )}

        {primaryBar && (
          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-white mb-6">ROI and verified visits</h2>
            <div className="mb-8">
              <BarQRCode barId={primaryBar.id} />
            </div>
            <ROIDashboard barId={primaryBar.id} />
          </section>
        )}

        {primaryBar && (
          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-white mb-6">Analytics and performance</h2>
            <AnalyticsDashboard barId={primaryBar.id} />
          </section>
        )}
      </main>
    </div>
  );
}
