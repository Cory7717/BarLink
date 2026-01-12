import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import Link from "next/link";

export default async function BarManagementPage({
  params,
}: {
  params: Promise<{ barId: string }>;
}) {
  const { barId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const bar = await prisma.bar.findUnique({
    where: { id: barId },
    include: {
      owner: true,
      offerings: true,
      events: true,
      inventoryItems: true,
    },
  });

  if (!bar) {
    redirect("/dashboard");
  }

  if (bar.owner.email !== session.user.email) {
    redirect("/dashboard");
  }

  const stats = {
    offerings: bar.offerings.length,
    events: bar.events.length,
    items: bar.inventoryItems.length,
  };

  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold text-gradient">{bar.name}</h1>
            <p className="text-slate-300 mt-2">
              {bar.address} • {bar.city}, {bar.state}
            </p>
          </div>
          <Link href="/dashboard" className="btn-secondary px-4 py-2 text-sm">
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="glass-panel rounded-2xl p-4">
            <h3 className="text-sm text-cyan-200">Offerings</h3>
            <p className="text-3xl font-semibold text-white mt-1">{stats.offerings}</p>
            <Link href={`/dashboard/bar/${bar.id}#offerings`} className="text-xs text-cyan-200 hover:text-cyan-100 mt-2 inline-block">
              Manage
            </Link>
          </div>

          <div className="glass-panel rounded-2xl p-4">
            <h3 className="text-sm text-cyan-200">Events</h3>
            <p className="text-3xl font-semibold text-white mt-1">{stats.events}</p>
            <Link href={`/dashboard/bar/${bar.id}#events`} className="text-xs text-cyan-200 hover:text-cyan-100 mt-2 inline-block">
              Manage
            </Link>
          </div>

          <div className="glass-panel rounded-2xl p-4">
            <h3 className="text-sm text-cyan-200">Inventory items</h3>
            <p className="text-3xl font-semibold text-white mt-1">{stats.items}</p>
            <Link href={`/dashboard/bar/${bar.id}/inventory`} className="text-xs text-cyan-200 hover:text-cyan-100 mt-2 inline-block">
              Manage
            </Link>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-6">Management</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div id="offerings" className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Drink specials and offerings</h3>
                <span className="text-2xl font-semibold text-white">{stats.offerings}</span>
              </div>
              <p className="text-sm text-slate-300 mb-4">
                Manage drink specials, happy hour deals, food offerings, and static menu items.
              </p>
              <Link href={`/dashboard/bar/${bar.id}/offerings`} className="btn-primary px-4 py-2 text-sm">
                Edit offerings
              </Link>
            </div>

            <div id="events" className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Events and promotions</h3>
                <span className="text-2xl font-semibold text-white">{stats.events}</span>
              </div>
              <p className="text-sm text-slate-300 mb-4">
                Create and manage special events, promotions, and themed nights at your bar.
              </p>
              <Link href={`/dashboard/bar/${bar.id}/events`} className="btn-primary px-4 py-2 text-sm">
                Edit events
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Liquor inventory</h3>
                <span className="text-2xl font-semibold text-white">{stats.items}</span>
              </div>
              <p className="text-sm text-slate-300 mb-4">
                Track bottles, manage stock levels, upload photos, and generate variance reports.
              </p>
              <Link href={`/dashboard/bar/${bar.id}/inventory`} className="btn-primary px-4 py-2 text-sm">
                Edit inventory
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">QR code and sharing</h3>
              </div>
              <p className="text-sm text-slate-300 mb-4">
                Generate and manage your bar QR code for easy check-ins and profile sharing.
              </p>
              <Link href={`/dashboard/bar/${bar.id}/qrcode`} className="btn-primary px-4 py-2 text-sm">
                View QR code
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Analytics and ROI</h3>
              </div>
              <p className="text-sm text-slate-300 mb-4">
                View visitor analytics, conversion rates, peak hours, and ROI metrics.
              </p>
              <Link href={`/dashboard/bar/${bar.id}/analytics`} className="btn-primary px-4 py-2 text-sm">
                View analytics
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Badges and achievements</h3>
              </div>
              <p className="text-sm text-slate-300 mb-4">
                Track earned badges, view achievement progress, and unlock new milestones.
              </p>
              <Link href={`/dashboard/bar/${bar.id}/badges`} className="btn-primary px-4 py-2 text-sm">
                View badges
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
