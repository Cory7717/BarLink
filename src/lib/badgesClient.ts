// Client-safe badge definitions (without functions)
// These are used on the client side for display only

export interface BadgeDefinitionClient {
  key: string;
  name: string;
  description: string;
  icon: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  category: 'FOUNDING' | 'ENGAGEMENT' | 'CONTENT' | 'PATRON_LOVE' | 'ACHIEVEMENT' | 'COMMUNITY' | 'SEASONAL';
  color: string;
  requirement: string;
}

// Helper functions for styling badges
export function getBadgeColor(color: string): {
  border: string;
  bg: string;
  text: string;
  glow: string;
} {
  const colorMap: Record<string, { border: string; bg: string; text: string; glow: string }> = {
    blue: {
      border: 'border-blue-500/30',
      bg: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5',
      text: 'text-blue-100',
      glow: 'shadow-blue-500/20',
    },
    emerald: {
      border: 'border-emerald-500/30',
      bg: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5',
      text: 'text-emerald-100',
      glow: 'shadow-emerald-500/20',
    },
    purple: {
      border: 'border-purple-500/30',
      bg: 'bg-gradient-to-br from-purple-500/10 to-purple-600/5',
      text: 'text-purple-100',
      glow: 'shadow-purple-500/20',
    },
    amber: {
      border: 'border-amber-500/30',
      bg: 'bg-gradient-to-br from-amber-500/10 to-amber-600/5',
      text: 'text-amber-100',
      glow: 'shadow-amber-500/20',
    },
    red: {
      border: 'border-red-500/30',
      bg: 'bg-gradient-to-br from-red-500/10 to-red-600/5',
      text: 'text-red-100',
      glow: 'shadow-red-500/20',
    },
    pink: {
      border: 'border-pink-500/30',
      bg: 'bg-gradient-to-br from-pink-500/10 to-pink-600/5',
      text: 'text-pink-100',
      glow: 'shadow-pink-500/20',
    },
    yellow: {
      border: 'border-yellow-500/30',
      bg: 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/5',
      text: 'text-yellow-100',
      glow: 'shadow-yellow-500/20',
    },
    indigo: {
      border: 'border-indigo-500/30',
      bg: 'bg-gradient-to-br from-indigo-500/10 to-indigo-600/5',
      text: 'text-indigo-100',
      glow: 'shadow-indigo-500/20',
    },
    cyan: {
      border: 'border-cyan-500/30',
      bg: 'bg-gradient-to-br from-cyan-500/10 to-cyan-600/5',
      text: 'text-cyan-100',
      glow: 'shadow-cyan-500/20',
    },
    teal: {
      border: 'border-teal-500/30',
      bg: 'bg-gradient-to-br from-teal-500/10 to-teal-600/5',
      text: 'text-teal-100',
      glow: 'shadow-teal-500/20',
    },
    green: {
      border: 'border-green-500/30',
      bg: 'bg-gradient-to-br from-green-500/10 to-green-600/5',
      text: 'text-green-100',
      glow: 'shadow-green-500/20',
    },
    rose: {
      border: 'border-rose-500/30',
      bg: 'bg-gradient-to-br from-rose-500/10 to-rose-600/5',
      text: 'text-rose-100',
      glow: 'shadow-rose-500/20',
    },
    violet: {
      border: 'border-violet-500/30',
      bg: 'bg-gradient-to-br from-violet-500/10 to-violet-600/5',
      text: 'text-violet-100',
      glow: 'shadow-violet-500/20',
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

export const BADGE_DEFINITIONS_CLIENT: Record<string, BadgeDefinitionClient> = {
  // FOUNDING TIER
  founding_member: {
    key: 'founding_member',
    name: 'Founding Member',
    description: 'One of the first bars on BarPulse',
    icon: '🏛️',
    tier: 'BRONZE',
    category: 'FOUNDING',
    color: 'blue',
    requirement: 'Created account within first 30 days',
  },

  // ENGAGEMENT TIER
  rising_star: {
    key: 'rising_star',
    name: 'Rising Star',
    description: 'Consistent weekly engagement',
    icon: '⭐',
    tier: 'BRONZE',
    category: 'ENGAGEMENT',
    color: 'emerald',
    requirement: '50+ views in the last 7 days',
  },

  popular_bar: {
    key: 'popular_bar',
    name: 'Popular Bar',
    description: 'High profile traffic',
    icon: '📈',
    tier: 'SILVER',
    category: 'ENGAGEMENT',
    color: 'blue',
    requirement: '200+ total profile views',
  },

  crowd_pleaser: {
    key: 'crowd_pleaser',
    name: 'Crowd Pleaser',
    description: 'Strong conversion from views to clicks',
    icon: '👥',
    tier: 'SILVER',
    category: 'ENGAGEMENT',
    color: 'purple',
    requirement: '10%+ click-through rate',
  },

  // CONTENT TIER
  content_creator: {
    key: 'content_creator',
    name: 'Content Creator',
    description: 'Active with offerings and events',
    icon: '🎨',
    tier: 'BRONZE',
    category: 'CONTENT',
    color: 'amber',
    requirement: '5+ active offerings or events',
  },

  event_master: {
    key: 'event_master',
    name: 'Event Master',
    description: 'Frequent event host',
    icon: '🎭',
    tier: 'SILVER',
    category: 'CONTENT',
    color: 'pink',
    requirement: '10+ events created',
  },

  // PATRON_LOVE TIER
  patron_favorite: {
    key: 'patron_favorite',
    name: 'Patron Favorite',
    description: 'High number of saved favorites',
    icon: '❤️',
    tier: 'BRONZE',
    category: 'PATRON_LOVE',
    color: 'red',
    requirement: 'Saved by 20+ customers',
  },

  loved_destination: {
    key: 'loved_destination',
    name: 'Loved Destination',
    description: 'Consistently saved by customers',
    icon: '💖',
    tier: 'GOLD',
    category: 'PATRON_LOVE',
    color: 'rose',
    requirement: 'Saved by 50+ customers',
  },

  // ACHIEVEMENT TIER
  verified_operator: {
    key: 'verified_operator',
    name: 'Verified Operator',
    description: 'Active subscription and verified content',
    icon: '✓',
    tier: 'SILVER',
    category: 'ACHIEVEMENT',
    color: 'emerald',
    requirement: 'Active Premium subscription',
  },

  multi_location: {
    key: 'multi_location',
    name: 'Multi-Location',
    description: 'Operating multiple bar locations',
    icon: '🏪',
    tier: 'GOLD',
    category: 'ACHIEVEMENT',
    color: 'indigo',
    requirement: '2+ licensed locations',
  },

  // COMMUNITY TIER
  community_builder: {
    key: 'community_builder',
    name: 'Community Builder',
    description: 'Strong engagement with customer base',
    icon: '🤝',
    tier: 'SILVER',
    category: 'COMMUNITY',
    color: 'teal',
    requirement: '30+ average daily active visitors',
  },

  social_butterfly: {
    key: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'High favorites and repeat visitors',
    icon: '🦋',
    tier: 'GOLD',
    category: 'COMMUNITY',
    color: 'violet',
    requirement: '50+ repeat customers',
  },

  // SEASONAL TIER
  holiday_hero: {
    key: 'holiday_hero',
    name: 'Holiday Hero',
    description: 'Special holiday event organizer',
    icon: '🎄',
    tier: 'BRONZE',
    category: 'SEASONAL',
    color: 'red',
    requirement: 'Holiday event scheduled',
  },

  summer_champion: {
    key: 'summer_champion',
    name: 'Summer Champion',
    description: 'Active in peak season',
    icon: '☀️',
    tier: 'BRONZE',
    category: 'SEASONAL',
    color: 'yellow',
    requirement: 'High activity during summer months',
  },
};

export function getBadgeDefinitionClient(key: string): BadgeDefinitionClient | undefined {
  return BADGE_DEFINITIONS_CLIENT[key];
}

export function getAllBadgesClient(): BadgeDefinitionClient[] {
  return Object.values(BADGE_DEFINITIONS_CLIENT);
}
