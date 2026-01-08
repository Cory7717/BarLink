import { prisma } from '@/lib/prisma';
import { BADGE_DEFINITIONS, type BadgeCheckData } from '@/lib/badges';
import { BADGE_DEFINITIONS_CLIENT } from '@/lib/badgesClient';

export class BadgeService {
  /**
   * Check and award all eligible badges for a bar
   */
  static async checkAndAwardBadges(barId: string): Promise<{
    newBadges: string[];
    totalBadges: number;
  }> {
    const badgeData = await this.getBadgeCheckData(barId);
    if (!badgeData) {
      return { newBadges: [], totalBadges: 0 };
    }

    const newBadges: string[] = [];

    // Check each badge definition
    for (const badgeDef of BADGE_DEFINITIONS) {
      // Check if bar already has this badge
      const existingBadge = await prisma.barBadge.findUnique({
        where: {
          barId_badgeKey: {
            barId,
            badgeKey: badgeDef.key,
          },
        },
      });

      // Skip if already awarded
      if (existingBadge) continue;

      // Check if criteria is met
      try {
        if (badgeDef.checkCriteria(badgeData)) {
          // Award the badge
          await prisma.barBadge.create({
            data: {
              barId,
              badgeKey: badgeDef.key,
              progress: JSON.stringify({
                viewsAtAward: badgeData.analytics.totalViews,
                clicksAtAward: badgeData.analytics.totalClicks,
              }),
            },
          });
          newBadges.push(badgeDef.key);
        }
      } catch (error) {
        console.error(`Error checking badge ${badgeDef.key}:`, error);
      }
    }

    // Get total badge count
    const totalBadges = await prisma.barBadge.count({
      where: { barId },
    });

    return { newBadges, totalBadges };
  }

  /**
   * Get all badges for a bar with their definitions
   */
  static async getBarBadges(barId: string) {
    const barBadges = await prisma.barBadge.findMany({
      where: { barId },
      orderBy: { awardedAt: 'desc' },
    });

    return barBadges.map((bb) => {
      // Provide client-safe badge definition (no functions)
      const definition = BADGE_DEFINITIONS_CLIENT[bb.badgeKey];
      return {
        ...bb,
        definition,
      };
    });
  }

  /**
   * Get badge progress for a bar
   */
  static async getBadgeProgress(barId: string) {
    const badgeData = await this.getBadgeCheckData(barId);
    if (!badgeData) return [];

    const progress = [];

    for (const badgeDef of BADGE_DEFINITIONS) {
      // Check if already awarded
      const existingBadge = await prisma.barBadge.findUnique({
        where: {
          barId_badgeKey: {
            barId,
            badgeKey: badgeDef.key,
          },
        },
      });

      if (existingBadge) continue;

      // Calculate progress toward badge
      const progressData = this.calculateProgress(badgeDef, badgeData);
      const clientDefinition = BADGE_DEFINITIONS_CLIENT[badgeDef.key];

      // Only return client-safe definitions to the frontend
      if (progressData && clientDefinition) {
        progress.push({
          badge: clientDefinition,
          progress: progressData,
        });
      }
    }

    return progress;
  }

  /**
   * Calculate progress percentage toward a specific badge
   */
  private static calculateProgress(
    badgeDef: (typeof BADGE_DEFINITIONS)[0],
    data: BadgeCheckData
  ): { percentage: number; current: number; target: number; metric: string } | null {
    // Badge-specific progress calculations
    switch (badgeDef.key) {
      case 'rising_star':
        return {
          percentage: Math.min((data.analytics.totalViews / 1000) * 100, 100),
          current: data.analytics.totalViews,
          target: 1000,
          metric: 'profile views',
        };
      case 'local_legend':
        return {
          percentage: Math.min((data.analytics.totalViews / 5000) * 100, 100),
          current: data.analytics.totalViews,
          target: 5000,
          metric: 'profile views',
        };
      case 'fan_favorite':
        return {
          percentage: Math.min((data.favorites.count / 100) * 100, 100),
          current: data.favorites.count,
          target: 100,
          metric: 'favorites',
        };
      case 'visual_storyteller':
        return {
          percentage: Math.min((data.bar.photos.length / 10) * 100, 100),
          current: data.bar.photos.length,
          target: 10,
          metric: 'photos',
        };
      case 'event_master':
        return {
          percentage: Math.min((data.events.total / 20) * 100, 100),
          current: data.events.total,
          target: 20,
          metric: 'events',
        };
      case 'deal_hunter':
        return {
          percentage: Math.min((data.offerings.special / 20) * 100, 100),
          current: data.offerings.special,
          target: 20,
          metric: 'special promotions',
        };
      case 'one_year_anniversary':
        const daysActive = Math.floor(
          (new Date().getTime() - data.bar.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          percentage: Math.min((daysActive / 365) * 100, 100),
          current: daysActive,
          target: 365,
          metric: 'days active',
        };
      case 'perfect_week':
        return {
          percentage: Math.min((data.analytics.consecutiveDaysActive / 7) * 100, 100),
          current: data.analytics.consecutiveDaysActive,
          target: 7,
          metric: 'consecutive days',
        };
      case 'consistent_contributor':
        return {
          percentage: Math.min((data.analytics.consecutiveDaysActive / 90) * 100, 100),
          current: data.analytics.consecutiveDaysActive,
          target: 90,
          metric: 'consecutive days',
        };
      case 'verified_pro': {
        const completed = [
          data.bar.description,
          data.bar.website,
          data.bar.phone,
          data.bar.photos.length > 0,
        ].filter(Boolean).length;
        return {
          percentage: (completed / 4) * 100,
          current: completed,
          target: 4,
          metric: 'profile fields',
        };
      }
      default:
        return null;
    }
  }

  /**
   * Gather all data needed for badge checking
   */
  private static async getBadgeCheckData(barId: string): Promise<BadgeCheckData | null> {
    const bar = await prisma.bar.findUnique({
      where: { id: barId },
      include: {
        owner: true,
      },
    });

    if (!bar) return null;

    // Get subscription separately
    const subscription = await prisma.subscription.findUnique({
      where: { ownerId: bar.ownerId },
    });

    // Get analytics data
    const [
      totalClicks,
      last7DaysClicks,
      offeringsData,
      eventsData,
      favoritesCount,
    ] = await Promise.all([
      // Total clicks
      prisma.barClick.count({
        where: {
          barId,
        },
      }),
      // Last 7 days clicks
      prisma.barClick.count({
        where: {
          barId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Offerings data
      prisma.offering.groupBy({
        by: ['isSpecial', 'isNew'],
        where: { barId },
        _count: true,
      }),
      // Events data
      Promise.all([
        prisma.event.count({ where: { barId } }),
        prisma.event.count({
          where: {
            barId,
            startTime: { gte: new Date().toISOString() },
          },
        }),
      ]),
      // Favorites count
      prisma.favorite.count({
        where: { barId },
      }),
    ]);

    // Get clicks breakdown by source
    const clicksBySource = await prisma.barClick.groupBy({
      by: ['source'],
      where: { barId },
      _count: true,
    });

    const clicksData = {
      total: totalClicks,
      fromSearch: clicksBySource.find(c => c.source === 'search')?._count || 0,
      fromMap: clicksBySource.find(c => c.source === 'map')?._count || 0,
      fromFavorites: clicksBySource.find(c => c.source === 'favorites')?._count || 0,
    };

    // Calculate metrics
    const totalOffers = offeringsData.reduce((sum, item) => sum + item._count, 0);
    const specialOffers = offeringsData
      .filter((item) => item.isSpecial)
      .reduce((sum, item) => sum + item._count, 0);
    const newOffers = offeringsData
      .filter((item) => item.isNew)
      .reduce((sum, item) => sum + item._count, 0);

    const averageClicksPerDay = totalClicks / Math.max(1, Math.floor((Date.now() - bar.createdAt.getTime()) / (1000 * 60 * 60 * 24)));
    const totalViews = bar.profileViews;
    const clickThroughRate = totalViews > 0 ? totalClicks / totalViews : 0;

    // Calculate consecutive days active (simplified)
    const recentClicks = await prisma.barClick.findMany({
      where: {
        barId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    let consecutiveDays = 0;
    if (recentClicks.length > 0) {
      const uniqueDays = new Set(
        recentClicks.map((c) => c.createdAt.toISOString().split('T')[0])
      );
      const sortedDays = Array.from(uniqueDays).sort().reverse();
      
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      for (const day of sortedDays) {
        const dayDate = new Date(day);
        const diff = Math.floor((currentDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diff === consecutiveDays) {
          consecutiveDays++;
        } else {
          break;
        }
      }
    }

    // Calculate weekly growth
    const previousWeekClicks = await prisma.barClick.count({
      where: {
        barId,
        createdAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });
    const weeklyGrowthRate = previousWeekClicks > 0 
      ? (last7DaysClicks - previousWeekClicks) / previousWeekClicks 
      : 0;

    return {
      bar: {
        id: bar.id,
        createdAt: bar.createdAt,
        profileViews: totalViews,
        searchAppearances: bar.searchAppearances,
        isPublished: bar.isPublished,
        photos: bar.photos,
        description: bar.description,
        website: bar.website,
        phone: bar.phone,
      },
      owner: {
        createdAt: bar.owner.createdAt,
        allowFreeListings: bar.owner.allowFreeListings,
      },
      subscription: subscription
        ? {
            createdAt: subscription.createdAt,
            status: subscription.status,
          }
        : null,
      analytics: {
        totalViews,
        totalClicks,
        totalSearchAppears: bar.searchAppearances,
        last7DaysViews: 0, // Not tracked separately
        last7DaysClicks,
        averageClicksPerDay,
        consecutiveDaysActive: consecutiveDays,
        weeklyGrowthRate,
      },
      offerings: {
        total: totalOffers,
        special: specialOffers,
        new: newOffers,
        categories: [], // Would need to add category tracking
      },
      events: {
        total: eventsData[0],
        upcoming: eventsData[1],
      },
      favorites: {
        count: favoritesCount,
      },
      clicks: {
        total: clicksData.total,
        fromSearch: clicksData.fromSearch,
        fromMap: clicksData.fromMap,
        fromFavorites: clicksData.fromFavorites,
        clickThroughRate,
      },
    };
  }

  /**
   * Seed initial badges into database
   */
  static async seedBadges() {
    console.log('Seeding badges...');
    
    for (const badgeDef of BADGE_DEFINITIONS) {
      await prisma.badge.upsert({
        where: { key: badgeDef.key },
        update: {
          name: badgeDef.name,
          description: badgeDef.description,
          icon: badgeDef.icon,
          tier: badgeDef.tier,
          category: badgeDef.category,
          requirement: badgeDef.requirement,
          color: badgeDef.color,
        },
        create: {
          key: badgeDef.key,
          name: badgeDef.name,
          description: badgeDef.description,
          icon: badgeDef.icon,
          tier: badgeDef.tier,
          category: badgeDef.category,
          requirement: badgeDef.requirement,
          color: badgeDef.color,
        },
      });
    }
    
    console.log(`Seeded ${BADGE_DEFINITIONS.length} badges`);
  }
}
