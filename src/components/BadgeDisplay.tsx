'use client';

import { getBadgeColor, getTierBadgeStyle, type BadgeDefinitionClient } from '@/lib/badgesClient';
import styles from './percent.module.css';

interface BadgeDisplayProps {
  badge: BadgeDefinitionClient;
  awardedAt?: Date;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function BadgeDisplay({ badge, awardedAt, size = 'md', showTooltip = true }: BadgeDisplayProps) {
  const colors = getBadgeColor(badge.color);
  const tierStyle = getTierBadgeStyle(badge.tier);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <div className="group relative inline-block">
      <div
        className={`
          inline-flex items-center gap-2 rounded-full border backdrop-blur-sm
          ${colors.border} ${colors.bg} ${sizeClasses[size]}
          transition-all duration-300 hover:scale-105 hover:shadow-lg ${colors.glow}
        `}
      >
        <span className={iconSizes[size]}>{badge.icon}</span>
        <span className={`font-medium ${colors.text}`}>{badge.name}</span>
        <span className="text-xs opacity-75">{tierStyle.emoji}</span>
      </div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-64">
          <div className="bg-slate-900 border border-white/20 rounded-lg p-3 shadow-xl backdrop-blur-md">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-2xl">{badge.icon}</span>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">{badge.name}</h4>
                <p className={`text-xs ${colors.text} mt-1`}>{badge.tier} Badge</p>
              </div>
            </div>
            <p className="text-slate-300 text-xs mb-2">{badge.description}</p>
            <div className="border-t border-white/10 pt-2">
              <p className="text-slate-400 text-xs">
                <span className="font-semibold">Requirement:</span> {badge.requirement}
              </p>
              {awardedAt && (
                <p className="text-slate-500 text-xs mt-1">
                  Earned {new Date(awardedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface BadgeGridProps {
  badges: Array<{
    badgeKey: string;
    awardedAt: Date;
    definition?: BadgeDefinitionClient;
  }>;
  emptyMessage?: string;
}

export function BadgeGrid({ badges, emptyMessage = 'No badges earned yet' }: BadgeGridProps) {
  if (badges.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  // Group by tier
  const groupedBadges = {
    PLATINUM: badges.filter((b) => b.definition?.tier === 'PLATINUM'),
    GOLD: badges.filter((b) => b.definition?.tier === 'GOLD'),
    SILVER: badges.filter((b) => b.definition?.tier === 'SILVER'),
    BRONZE: badges.filter((b) => b.definition?.tier === 'BRONZE'),
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedBadges).map(([tier, tierBadges]) => {
        if (tierBadges.length === 0) return null;

        const tierStyle = getTierBadgeStyle(tier);

        return (
          <div key={tier}>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span>{tierStyle.emoji}</span>
              <span className={`bg-linear-to-r ${tierStyle.gradient} bg-clip-text text-transparent`}>
                {tier} Badges
              </span>
              <span className="text-slate-400 text-sm font-normal">({tierBadges.length})</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {tierBadges.map((badge) =>
                badge.definition ? (
                  <BadgeDisplay
                    key={badge.badgeKey}
                    badge={badge.definition}
                    awardedAt={badge.awardedAt}
                    size="md"
                  />
                ) : null
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface BadgeProgressProps {
  progress: Array<{
    badge: BadgeDefinitionClient;
    progress: {
      percentage: number;
      current: number;
      target: number;
      metric: string;
    };
  }>;
  limit?: number;
}

export function BadgeProgress({ progress, limit = 5 }: BadgeProgressProps) {
  const sortedProgress = progress
    .sort((a, b) => b.progress.percentage - a.progress.percentage)
    .slice(0, limit);

  if (sortedProgress.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400 text-sm">All available badges earned! 🎉</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedProgress.map(({ badge, progress: prog }) => {
        const colors = getBadgeColor(badge.color);

        return (
          <div
            key={badge.key}
            className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-lg p-4 hover:border-white/20 transition-all"
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{badge.icon}</span>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">{badge.name}</h4>
                <p className="text-slate-400 text-xs mt-1">{badge.description}</p>
              </div>
              <span className={`text-xs font-semibold ${colors.text}`}>{badge.tier}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">
                  {prog.current} / {prog.target} {prog.metric}
                </span>
                <span className={`font-semibold ${colors.text}`}>{Math.round(prog.percentage)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-linear-to-r ${colors.border.replace('border-', 'from-')} to-transparent transition-all duration-500 ${styles['wPct' + Math.max(0, Math.min(100, Math.round(prog.percentage))) ]}`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface BadgeShowcaseProps {
  badges: Array<{
    badgeKey: string;
    awardedAt: Date;
    definition?: BadgeDefinitionClient;
  }>;
  limit?: number;
}

export function BadgeShowcase({ badges, limit = 3 }: BadgeShowcaseProps) {
  // Show top tier badges first
  const tierOrder = ['PLATINUM', 'GOLD', 'SILVER', 'BRONZE'];
  const sortedBadges = badges
    .filter((b) => b.definition)
    .sort((a, b) => {
      const aTierIndex = tierOrder.indexOf(a.definition!.tier);
      const bTierIndex = tierOrder.indexOf(b.definition!.tier);
      if (aTierIndex !== bTierIndex) return aTierIndex - bTierIndex;
      return new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime();
    })
    .slice(0, limit);

  if (sortedBadges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {sortedBadges.map((badge) =>
        badge.definition ? (
          <BadgeDisplay
            key={badge.badgeKey}
            badge={badge.definition}
            awardedAt={badge.awardedAt}
            size="sm"
          />
        ) : null
      )}
    </div>
  );
}
