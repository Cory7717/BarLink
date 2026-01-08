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
      barLicenses: true,
      inventoryItems: true,
    },
  });

  if (!bar) {
    redirect("/dashboard");
  }

  // Verify ownership
  if (bar.owner.email !== session.user.email) {
    redirect("/dashboard");
  }

  const license = bar.barLicenses?.[0];
  const stats = {
    offerings: bar.offerings.length,
    events: bar.events.length,
    items: bar.inventoryItems.length,
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
              {bar.name}
            </h1>
            <p className="text-slate-400 mt-2">
              {bar.address} • {bar.city}, {bar.state}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg border border-white/20 bg-white/5 backdrop-blur-md px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-all"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* License Status Card */}
        <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">License Status</h2>
              <p className="text-sm text-slate-300 mt-1">
                {license ? `Updated: ${new Date(license.updatedAt).toLocaleDateString()}` : 'No license on file'}
              </p>
            </div>
            <span className={`text-sm font-semibold rounded-full px-4 py-2 ${
              license?.status === 'ACTIVE'
                ? 'bg-emerald-500/20 text-emerald-100'
                : license?.status === 'PAST_DUE'
                ? 'bg-amber-500/20 text-amber-100'
                : 'bg-slate-600/40 text-slate-200'
            }`}>
              {license?.status ?? 'UNLICENSED'}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="rounded-xl border border-cyan-500/30 bg-linear-to-br from-cyan-500/10 to-cyan-600/5 backdrop-blur-md p-4">
            <h3 className="text-sm text-cyan-300">Offerings</h3>
            <p className="text-3xl font-bold text-cyan-100 mt-1">{stats.offerings}</p>
            <Link
              href={`/dashboard/bar/${bar.id}#offerings`}
              className="text-xs text-cyan-400 hover:text-cyan-300 mt-2 inline-block"
            >
              Manage →
            </Link>
          </div>

          <div className="rounded-xl border border-purple-500/30 bg-linear-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-md p-4">
            <h3 className="text-sm text-purple-300">Events</h3>
            <p className="text-3xl font-bold text-purple-100 mt-1">{stats.events}</p>
            <Link
              href={`/dashboard/bar/${bar.id}#events`}
              className="text-xs text-purple-400 hover:text-purple-300 mt-2 inline-block"
            >
              Manage →
            </Link>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-linear-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-md p-4">
            <h3 className="text-sm text-emerald-300">Inventory Items</h3>
            <p className="text-3xl font-bold text-emerald-100 mt-1">{stats.items}</p>
            <Link
              href={`/dashboard/bar/${bar.id}/inventory`}
              className="text-xs text-emerald-400 hover:text-emerald-300 mt-2 inline-block"
            >
              Manage →
            </Link>
          </div>
        </div>

        {/* Management Sections */}
        <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-6">Management</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Offerings Section */}
            <div id="offerings" className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-cyan-100">Drink Specials & Offerings</h3>
                <span className="text-2xl font-bold text-cyan-300">{stats.offerings}</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Manage drink specials, happy hour deals, food offerings, and static menu items.
              </p>
              <Link
                href={`/dashboard/bar/${bar.id}/offerings`}
                className="inline-flex rounded-lg bg-linear-to-r from-cyan-400 to-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:from-cyan-300 hover:to-sky-400 transition-all"
              >
                Edit Offerings
              </Link>
            </div>

            {/* Events Section */}
            <div id="events" className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-purple-100">Events & Promotions</h3>
                <span className="text-2xl font-bold text-purple-300">{stats.events}</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Create and manage special events, promotions, and themed nights at your bar.
              </p>
              <Link
                href={`/dashboard/bar/${bar.id}/events`}
                className="inline-flex rounded-lg bg-linear-to-r from-purple-400 to-pink-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:from-purple-300 hover:to-pink-400 transition-all"
              >
                Edit Events
              </Link>
            </div>

            {/* Inventory Section */}
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-emerald-100">Liquor Inventory</h3>
                <span className="text-2xl font-bold text-emerald-300">{stats.items}</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Track liquor bottles, manage stock levels, upload photos, and generate variance reports.
              </p>
              <Link
                href={`/dashboard/bar/${bar.id}/inventory`}
                className="inline-flex rounded-lg bg-linear-to-r from-emerald-400 to-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:from-emerald-300 hover:to-teal-400 transition-all"
              >
                Edit Inventory
              </Link>
            </div>

            {/* QR Code Section */}
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-blue-100">QR Code & Sharing</h3>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Generate and manage your bar&apos;s QR code for easy customer check-ins and profile sharing.
              </p>
              <Link
                href={`/dashboard/bar/${bar.id}/qrcode`}
                className="inline-flex rounded-lg bg-linear-to-r from-blue-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:from-blue-300 hover:to-indigo-400 transition-all"
              >
                View QR Code
              </Link>
            </div>

            {/* Analytics Section */}
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-amber-100">Analytics & ROI</h3>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                View visitor analytics, conversion rates, peak hours, and return on investment metrics.
              </p>
              <Link
                href={`/dashboard/bar/${bar.id}/analytics`}
                className="inline-flex rounded-lg bg-linear-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:from-amber-300 hover:to-orange-400 transition-all"
              >
                View Analytics
              </Link>
            </div>

            {/* Badges Section */}
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-pink-100">Badges & Achievements</h3>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Track earned badges, view achievement progress, and unlock new milestone rewards.
              </p>
              <Link
                href={`/dashboard/bar/${bar.id}/badges`}
                className="inline-flex rounded-lg bg-linear-to-r from-pink-400 to-rose-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:from-pink-300 hover:to-rose-400 transition-all"
              >
                View Badges
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
