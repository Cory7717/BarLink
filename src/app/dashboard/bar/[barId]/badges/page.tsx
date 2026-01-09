import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { BadgeService } from '@/lib/badgeService';

export default async function BadgesPage({
  params,
}: {
  params: Promise<{ barId: string }>;
}) {
  const { barId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const bar = await prisma.bar.findUnique({
    where: { id: barId },
    include: { owner: true },
  });

  if (!bar) {
    redirect('/dashboard');
  }

  if (bar.owner.email !== session.user.email) {
    redirect('/dashboard');
  }

  const badges = await BadgeService.getBarBadges(barId);
  const progress = await BadgeService.getBadgeProgress(barId);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-pink-200 to-rose-200 bg-clip-text text-transparent">
              Badges & Achievements
            </h1>
            <p className="text-slate-400 mt-2">{bar.name}</p>
          </div>
          <Link
            href={`/dashboard/bar/${bar.id}`}
            className="rounded-lg border border-white/20 bg-white/5 backdrop-blur-md px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-all"
          >
            Back
          </Link>
        </div>

        {/* Earned Badges */}
        <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Earned Badges ({badges.length})
          </h2>
          {badges.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No badges earned yet. Keep growing your bar to unlock achievements!
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-lg border border-pink-500/30 bg-linear-to-br from-pink-500/10 to-rose-500/10 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{badge.definition?.icon || '🏆'}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {badge.definition?.name || badge.badgeKey}
                      </h3>
                      <p className="text-sm text-slate-300">
                        {badge.definition?.description || 'Badge earned'}
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

        {/* Progress Toward Badges */}
        <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">
            In Progress ({progress.length})
          </h2>
          {progress.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              You&apos;ve unlocked all available badges! 🎉
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {progress.map((item) => (
                <div
                  key={item.badge.key}
                  className="rounded-lg border border-slate-700/40 bg-slate-900/40 p-4"
                >
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
                        <span>{item.progress.current} / {item.progress.target} {item.progress.metric}</span>
                        <span>{item.progress.percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-pink-400 to-rose-500 transition-all"
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
