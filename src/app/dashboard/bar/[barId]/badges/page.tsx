import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { BadgeService } from "@/lib/badgeService";

export default async function BadgesPage({
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
    include: { owner: true },
  });

  if (!bar) {
    redirect("/dashboard");
  }

  if (bar.owner.email !== session.user.email) {
    redirect("/dashboard");
  }

  const badges = await BadgeService.getBarBadges(barId);
  const progress = await BadgeService.getBadgeProgress(barId);

  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gradient">Badges and achievements</h1>
            <p className="text-slate-300 mt-2">{bar.name}</p>
          </div>
          <Link href={`/dashboard/bar/${bar.id}`} className="btn-secondary px-4 py-2 text-sm">
            Back
          </Link>
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Earned badges ({badges.length})</h2>
          {badges.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No badges earned yet. Keep growing your bar to unlock achievements.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {badges.map((badge) => (
                <div key={badge.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{badge.definition?.icon || "🏆"}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {badge.definition?.name || badge.badgeKey}
                      </h3>
                      <p className="text-sm text-slate-300">
                        {badge.definition?.description || "Badge earned"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Earned {new Date(badge.awardedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">In progress ({progress.length})</h2>
          {progress.length === 0 ? (
            <p className="text-slate-400 text-center py-8">You have unlocked all available badges.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {progress.map((item) => (
                <div key={item.badge.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl opacity-60">{item.badge.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{item.badge.name}</h3>
                      <p className="text-sm text-slate-400">{item.badge.description}</p>
                    </div>
                  </div>
                  {item.progress && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>
                          {item.progress.current} / {item.progress.target} {item.progress.metric}
                        </span>
                        <span>{item.progress.percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-cyan-400 to-emerald-400 transition-all"
                          style={{ width: `${Math.min(item.progress.percentage, 100)}%` } as React.CSSProperties}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
