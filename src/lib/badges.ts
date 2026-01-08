// Badge definitions and criteria

export interface BadgeDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  category: 'FOUNDING' | 'ENGAGEMENT' | 'CONTENT' | 'PATRON_LOVE' | 'ACHIEVEMENT' | 'COMMUNITY' | 'SEASONAL';
  color: string; // Tailwind color name
  checkCriteria: (data: BadgeCheckData) => boolean;
  requirement: string; // Human-readable requirement
}

export interface BadgeCheckData {
  bar: {
    id: string;
    createdAt: Date;
    profileViews: number;
    searchAppearances: number;
    isPublished: boolean;
    photos: string[];
    description: string | null;
    website: string | null;
    phone: string | null;
  };
  owner: {
    createdAt: Date;
    allowFreeListings: boolean;
  };
  subscription?: {
    createdAt: Date;
    status: string;
  } | null;
  analytics: {
    totalViews: number;
    totalClicks: number;
    totalSearchAppears: number;
    last7DaysViews: number;
    last7DaysClicks: number;
    averageClicksPerDay: number;
    consecutiveDaysActive: number;
    weeklyGrowthRate: number;
  };
  offerings: {
    total: number;
    special: number;
    new: number;
    categories: string[];
  };
  events: {
    total: number;
    upcoming: number;
  };
  favorites: {
    count: number;
  };
  clicks: {
    total: number;
    fromSearch: number;
    fromMap: number;
    fromFavorites: number;
    clickThroughRate: number;
  };
  rankings?: {
    cityRank?: number;
    categoryRank?: number;
  };
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // FOUNDING & LOYALTY BADGES
  {
    key: 'founding_member',
    name: 'Founding Member',
    description: 'One of the first 100 bars on BarPulse',
    icon: '🌟',
    tier: 'PLATINUM',
    category: 'FOUNDING',
    color: 'purple',
    requirement: 'Be in the first 100 bars to join',
    checkCriteria: (_data) => {
      // This would be set manually or checked against bar creation order
      return false; // Will be awarded manually
    },
  },
  {
    key: 'early_adopter',
    name: 'Early Adopter',
    description: 'Joined in the first 6 months',
    icon: '🎖️',
    tier: 'GOLD',
    category: 'FOUNDING',
    color: 'amber',
    requirement: 'Join within the first 6 months of platform launch',
    checkCriteria: (data) => {
      const platformLaunch = new Date('2026-01-01');
      const sixMonthsAfterLaunch = new Date(platformLaunch);
      sixMonthsAfterLaunch.setMonth(sixMonthsAfterLaunch.getMonth() + 6);
      return data.bar.createdAt <= sixMonthsAfterLaunch;
    },
  },
  {
    key: 'one_year_anniversary',
    name: '1 Year Anniversary',
    description: 'Active on BarPulse for 1 year',
    icon: '🎂',
    tier: 'SILVER',
    category: 'FOUNDING',
    color: 'blue',
    requirement: 'Be active for 1 year',
    checkCriteria: (data) => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return data.bar.createdAt <= oneYearAgo;
    },
  },
  {
    key: 'consistent_contributor',
    name: 'Consistent Contributor',
    description: 'Updated offerings for 90 consecutive days',
    icon: '🔄',
    tier: 'GOLD',
    category: 'FOUNDING',
    color: 'emerald',
    requirement: 'Update offerings for 90+ consecutive days',
    checkCriteria: (data) => {
      return data.analytics.consecutiveDaysActive >= 90;
    },
  },

  // ENGAGEMENT & PERFORMANCE BADGES
  {
    key: 'trending',
    name: 'Trending',
    description: 'Top 10% growth in views this week',
    icon: '🔥',
    tier: 'GOLD',
    category: 'ENGAGEMENT',
    color: 'red',
    requirement: 'Achieve top 10% weekly growth rate',
    checkCriteria: (data) => {
      return data.analytics.weeklyGrowthRate >= 0.5; // 50% growth
    },
  },
  {
    key: 'rising_star',
    name: 'Rising Star',
    description: 'Reached 1,000+ profile views',
    icon: '⭐',
    tier: 'SILVER',
    category: 'ENGAGEMENT',
    color: 'yellow',
    requirement: 'Accumulate 1,000+ profile views',
    checkCriteria: (data) => {
      return data.analytics.totalViews >= 1000;
    },
  },
  {
    key: 'local_legend',
    name: 'Local Legend',
    description: 'Achieved 5,000+ profile views',
    icon: '🌟',
    tier: 'GOLD',
    category: 'ENGAGEMENT',
    color: 'purple',
    requirement: 'Accumulate 5,000+ profile views',
    checkCriteria: (data) => {
      return data.analytics.totalViews >= 5000;
    },
  },
  {
    key: 'city_champion',
    name: 'City Champion',
    description: 'Most viewed bar in your city this month',
    icon: '👑',
    tier: 'PLATINUM',
    category: 'ENGAGEMENT',
    color: 'amber',
    requirement: 'Be the #1 most viewed bar in your city',
    checkCriteria: (data) => {
      return data.rankings?.cityRank === 1;
    },
  },
  {
    key: 'perfect_week',
    name: 'Perfect Week',
    description: '7 days of consistent engagement',
    icon: '💯',
    tier: 'BRONZE',
    category: 'ENGAGEMENT',
    color: 'blue',
    requirement: 'Have activity every day for 7 days',
    checkCriteria: (data) => {
      return data.analytics.consecutiveDaysActive >= 7;
    },
  },
  {
    key: 'momentum_builder',
    name: 'Momentum Builder',
    description: '3 consecutive weeks of growth',
    icon: '📈',
    tier: 'SILVER',
    category: 'ENGAGEMENT',
    color: 'emerald',
    requirement: 'Show growth for 3 consecutive weeks',
    checkCriteria: (data) => {
      return data.analytics.weeklyGrowthRate > 0; // Simplified check
    },
  },

  // CONTENT QUALITY BADGES
  {
    key: 'verified_pro',
    name: 'Verified Pro',
    description: 'Complete profile with all information filled',
    icon: '✅',
    tier: 'BRONZE',
    category: 'CONTENT',
    color: 'green',
    requirement: 'Complete all profile fields',
    checkCriteria: (data) => {
      return !!(
        data.bar.description &&
        data.bar.website &&
        data.bar.phone &&
        data.bar.photos.length > 0
      );
    },
  },
  {
    key: 'visual_storyteller',
    name: 'Visual Storyteller',
    description: 'Uploaded 10+ high-quality photos',
    icon: '📸',
    tier: 'SILVER',
    category: 'CONTENT',
    color: 'purple',
    requirement: 'Upload 10+ photos',
    checkCriteria: (data) => {
      return data.bar.photos.length >= 10;
    },
  },
  {
    key: 'event_master',
    name: 'Event Master',
    description: 'Hosted 20+ events',
    icon: '🎪',
    tier: 'GOLD',
    category: 'CONTENT',
    color: 'pink',
    requirement: 'Create and host 20+ events',
    checkCriteria: (data) => {
      return data.events.total >= 20;
    },
  },
  {
    key: 'weekly_warrior',
    name: 'Weekly Warrior',
    description: 'Updated offerings every week for a month',
    icon: '📅',
    tier: 'SILVER',
    category: 'CONTENT',
    color: 'blue',
    requirement: 'Update offerings weekly for 4 consecutive weeks',
    checkCriteria: (data) => {
      return data.analytics.consecutiveDaysActive >= 28;
    },
  },
  {
    key: 'trivia_king',
    name: 'Trivia King',
    description: 'Known for exceptional trivia nights',
    icon: '🧠',
    tier: 'GOLD',
    category: 'CONTENT',
    color: 'indigo',
    requirement: 'Run trivia events regularly',
    checkCriteria: (data) => {
      return data.offerings.categories.includes('trivia') && data.offerings.total >= 10;
    },
  },
  {
    key: 'karaoke_champion',
    name: 'Karaoke Champion',
    description: 'The go-to spot for karaoke',
    icon: '🎤',
    tier: 'GOLD',
    category: 'CONTENT',
    color: 'pink',
    requirement: 'Run karaoke events regularly',
    checkCriteria: (data) => {
      return data.offerings.categories.includes('karaoke') && data.offerings.total >= 10;
    },
  },

  // PATRON LOVE BADGES
  {
    key: 'fan_favorite',
    name: 'Fan Favorite',
    description: 'Saved by 100+ patrons',
    icon: '❤️',
    tier: 'GOLD',
    category: 'PATRON_LOVE',
    color: 'red',
    requirement: 'Be favorited by 100+ users',
    checkCriteria: (data) => {
      return data.favorites.count >= 100;
    },
  },
  {
    key: 'map_star',
    name: 'Map Star',
    description: 'High click-through rate from map',
    icon: '🗺️',
    tier: 'SILVER',
    category: 'PATRON_LOVE',
    color: 'blue',
    requirement: 'Maintain >10% CTR from map clicks',
    checkCriteria: (data) => {
      return data.clicks.clickThroughRate >= 0.1;
    },
  },
  {
    key: 'search_superstar',
    name: 'Search Superstar',
    description: 'Frequently appears in top search results',
    icon: '🔍',
    tier: 'GOLD',
    category: 'PATRON_LOVE',
    color: 'purple',
    requirement: 'High search result ranking',
    checkCriteria: (data) => {
      return data.analytics.totalSearchAppears >= 1000 && data.clicks.fromSearch >= 100;
    },
  },
  {
    key: 'quick_click',
    name: 'Quick Click',
    description: 'Above-average click-to-view ratio',
    icon: '⚡',
    tier: 'BRONZE',
    category: 'PATRON_LOVE',
    color: 'yellow',
    requirement: 'Achieve >15% click-through rate',
    checkCriteria: (data) => {
      return data.clicks.clickThroughRate >= 0.15;
    },
  },
  {
    key: 'patrons_choice',
    name: "Patron's Choice",
    description: 'Most favorited in your category this month',
    icon: '🎊',
    tier: 'PLATINUM',
    category: 'PATRON_LOVE',
    color: 'pink',
    requirement: 'Be #1 favorited in your category',
    checkCriteria: (data) => {
      return data.rankings?.categoryRank === 1 && data.favorites.count >= 50;
    },
  },

  // SPECIAL ACHIEVEMENT BADGES
  {
    key: 'always_fresh',
    name: 'Always Fresh',
    description: 'Posted 10+ "new" offerings',
    icon: '🆕',
    tier: 'SILVER',
    category: 'ACHIEVEMENT',
    color: 'cyan',
    requirement: 'Mark 10+ offerings as "new"',
    checkCriteria: (data) => {
      return data.offerings.new >= 10;
    },
  },
  {
    key: 'deal_hunter',
    name: 'Deal Hunter',
    description: 'Ran 20+ special promotions',
    icon: '🎁',
    tier: 'GOLD',
    category: 'ACHIEVEMENT',
    color: 'emerald',
    requirement: 'Create 20+ special promotions',
    checkCriteria: (data) => {
      return data.offerings.special >= 20;
    },
  },
  {
    key: 'night_life_leader',
    name: 'Night Life Leader',
    description: 'Strong late-night engagement (10pm-2am)',
    icon: '🌃',
    tier: 'SILVER',
    category: 'ACHIEVEMENT',
    color: 'indigo',
    requirement: 'High engagement during late-night hours',
    checkCriteria: (data) => {
      // This would require time-based analytics
      return data.analytics.totalClicks >= 500;
    },
  },
  {
    key: 'happy_hour_hero',
    name: 'Happy Hour Hero',
    description: 'Consistent daily happy hour posts',
    icon: '🍻',
    tier: 'GOLD',
    category: 'ACHIEVEMENT',
    color: 'amber',
    requirement: 'Run happy hour specials regularly',
    checkCriteria: (data) => {
      return data.offerings.categories.includes('happy-hour') && data.offerings.total >= 15;
    },
  },
  {
    key: 'neighborhood_gem',
    name: 'Neighborhood Gem',
    description: 'Top-rated bar in your neighborhood',
    icon: '📍',
    tier: 'PLATINUM',
    category: 'ACHIEVEMENT',
    color: 'teal',
    requirement: 'Be #1 in your neighborhood',
    checkCriteria: (data) => {
      return !!(data.rankings?.cityRank && data.rankings.cityRank <= 3);
    },
  },

  // COMMUNITY BADGES
  {
    key: 'live_music_venue',
    name: 'Live Music Venue',
    description: 'Hosted 50+ live music events',
    icon: '🎵',
    tier: 'GOLD',
    category: 'COMMUNITY',
    color: 'purple',
    requirement: 'Host 50+ live music events',
    checkCriteria: (data) => {
      return data.offerings.categories.includes('live-music') && data.events.total >= 50;
    },
  },
];

export function getBadgeColor(color: string): {
  border: string;
  bg: string;
  text: string;
  glow: string;
} {
  const colorMap: Record<string, { border: string; bg: string; text: string; glow: string }> = {
    blue: {
      border: 'border-blue-500/30',
      bg: 'bg-linear-to-br from-blue-500/10 to-blue-600/5',
      text: 'text-blue-100',
      glow: 'shadow-blue-500/20',
    },
    emerald: {
      border: 'border-emerald-500/30',
      bg: 'bg-linear-to-br from-emerald-500/10 to-emerald-600/5',
      text: 'text-emerald-100',
      glow: 'shadow-emerald-500/20',
    },
    purple: {
      border: 'border-purple-500/30',
      bg: 'bg-linear-to-br from-purple-500/10 to-purple-600/5',
      text: 'text-purple-100',
      glow: 'shadow-purple-500/20',
    },
    amber: {
      border: 'border-amber-500/30',
      bg: 'bg-linear-to-br from-amber-500/10 to-amber-600/5',
      text: 'text-amber-100',
      glow: 'shadow-amber-500/20',
    },
    red: {
      border: 'border-red-500/30',
      bg: 'bg-linear-to-br from-red-500/10 to-red-600/5',
      text: 'text-red-100',
      glow: 'shadow-red-500/20',
    },
    pink: {
      border: 'border-pink-500/30',
      bg: 'bg-linear-to-br from-pink-500/10 to-pink-600/5',
      text: 'text-pink-100',
      glow: 'shadow-pink-500/20',
    },
    yellow: {
      border: 'border-yellow-500/30',
      bg: 'bg-linear-to-br from-yellow-500/10 to-yellow-600/5',
      text: 'text-yellow-100',
      glow: 'shadow-yellow-500/20',
    },
    indigo: {
      border: 'border-indigo-500/30',
      bg: 'bg-linear-to-br from-indigo-500/10 to-indigo-600/5',
      text: 'text-indigo-100',
      glow: 'shadow-indigo-500/20',
    },
    cyan: {
      border: 'border-cyan-500/30',
      bg: 'bg-linear-to-br from-cyan-500/10 to-cyan-600/5',
      text: 'text-cyan-100',
      glow: 'shadow-cyan-500/20',
    },
    teal: {
      border: 'border-teal-500/30',
      bg: 'bg-linear-to-br from-teal-500/10 to-teal-600/5',
      text: 'text-teal-100',
      glow: 'shadow-teal-500/20',
    },
    green: {
      border: 'border-green-500/30',
      bg: 'bg-linear-to-br from-green-500/10 to-green-600/5',
      text: 'text-green-100',
      glow: 'shadow-green-500/20',
    },
  };

  return colorMap[color] || colorMap.blue;
}

export function getTierBadgeStyle(tier: string): { emoji: string; gradient: string } {
  const tierStyles: Record<string, { emoji: string; gradient: string }> = {
    BRONZE: { emoji: '🥉', gradient: 'from-amber-700 to-amber-900' },
    SILVER: { emoji: '🥈', gradient: 'from-slate-400 to-slate-600' },
    GOLD: { emoji: '🥇', gradient: 'from-yellow-400 to-yellow-600' },
    PLATINUM: { emoji: '💎', gradient: 'from-cyan-400 to-blue-600' },
  };

  return tierStyles[tier] || tierStyles.BRONZE;
}
