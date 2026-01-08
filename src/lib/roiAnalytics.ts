import { prisma } from '@/lib/prisma';

export interface ROIMetrics {
  // Conversion funnel
  totalViews: number;
  totalClicks: number;
  totalVisits: number;
  
  // Conversion rates
  clickThroughRate: number; // clicks / views
  visitConversionRate: number; // visits / clicks
  overallConversionRate: number; // visits / views
  
  // Visit breakdown
  visitsBySource: {
    qr_code: number;
    promo_code: number;
    manual: number;
    location: number;
  };
  
  // Time-based metrics
  averageTimeToVisit: number; // Average time between click and visit (in hours)
  repeatVisitorRate: number; // Percentage of visitors who came back
  
  // ROI calculations
  estimatedRevenue: number;
  costPerVisit: number;
  returnOnInvestment: number; // (revenue - cost) / cost
  
  // Trends
  dailyVisits: Array<{
    date: string;
    visits: number;
    views: number;
    clicks: number;
  }>;
  
  peakVisitTimes: Array<{
    hour: number;
    count: number;
  }>;
  
  topVisitDays: Array<{
    dayOfWeek: number;
    dayName: string;
    visits: number;
  }>;
}

export interface ROIAnalyticsOptions {
  barId: string;
  days?: number;
  subscriptionCost?: number;
  averageCheckSize?: number;
}

export class ROIAnalyticsService {
  static async calculateROI(options: ROIAnalyticsOptions): Promise<ROIMetrics> {
    const { barId, days = 30, subscriptionCost = 29, averageCheckSize = 25 } = options;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all clicks in time period
    const [clicks, visits] = await Promise.all([
      prisma.barClick.findMany({
        where: {
          barId,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.barVisit.findMany({
        where: {
          barId,
          visitedAt: { gte: startDate },
        },
        orderBy: { visitedAt: 'asc' },
        include: {
          user: {
            select: { id: true },
          },
        },
      }),
    ]);

    // Calculate basic metrics
    const totalViews = clicks.length;
    const totalClicks = clicks.filter(c => c.source !== 'direct').length;
    const totalVisits = visits.length;

    // Conversion rates
    const clickThroughRate = totalViews > 0 ? totalClicks / totalViews : 0;
    const visitConversionRate = totalClicks > 0 ? totalVisits / totalClicks : 0;
    const overallConversionRate = totalViews > 0 ? totalVisits / totalViews : 0;

    // Visits by source
    const visitsBySource = {
      qr_code: visits.filter(v => v.source === 'qr_code').length,
      promo_code: visits.filter(v => v.source === 'promo_code').length,
      manual: visits.filter(v => v.source === 'manual').length,
      location: visits.filter(v => v.source === 'location').length,
    };

    // Calculate average time to visit
    let totalTimeToVisit = 0;
    let matchedVisits = 0;
    
    for (const visit of visits) {
      if (visit.clickId) {
        const click = clicks.find(c => c.id === visit.clickId);
        if (click) {
          const timeToVisit = (visit.visitedAt.getTime() - click.createdAt.getTime()) / (1000 * 60 * 60);
          if (timeToVisit >= 0 && timeToVisit <= 168) { // Within 1 week
            totalTimeToVisit += timeToVisit;
            matchedVisits++;
          }
        }
      }
    }
    const averageTimeToVisit = matchedVisits > 0 ? totalTimeToVisit / matchedVisits : 0;

    // Calculate repeat visitor rate
    const userVisitCounts = new Map<string, number>();
    visits.forEach(visit => {
      if (visit.userId) {
        userVisitCounts.set(visit.userId, (userVisitCounts.get(visit.userId) || 0) + 1);
      }
    });
    const repeatVisitors = Array.from(userVisitCounts.values()).filter(count => count > 1).length;
    const totalUniqueVisitors = userVisitCounts.size || 1;
    const repeatVisitorRate = repeatVisitors / totalUniqueVisitors;

    // ROI calculations
    const estimatedRevenue = totalVisits * averageCheckSize;
    const costPerVisit = totalVisits > 0 ? subscriptionCost / totalVisits : subscriptionCost;
    const returnOnInvestment = subscriptionCost > 0 
      ? ((estimatedRevenue - subscriptionCost) / subscriptionCost) * 100
      : 0;

    // Daily visits trend
    const dailyData = new Map<string, { visits: number; views: number; clicks: number }>();
    
    clicks.forEach(click => {
      const date = click.createdAt.toISOString().split('T')[0];
      if (!dailyData.has(date)) {
        dailyData.set(date, { visits: 0, views: 0, clicks: 0 });
      }
      dailyData.get(date)!.views++;
      if (click.source !== 'direct') {
        dailyData.get(date)!.clicks++;
      }
    });

    visits.forEach(visit => {
      const date = visit.visitedAt.toISOString().split('T')[0];
      if (!dailyData.has(date)) {
        dailyData.set(date, { visits: 0, views: 0, clicks: 0 });
      }
      dailyData.get(date)!.visits++;
    });

    const dailyVisits = Array.from(dailyData.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Peak visit times (hour of day)
    const hourCounts = new Map<number, number>();
    visits.forEach(visit => {
      const hour = visit.visitedAt.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    const peakVisitTimes = Array.from(hourCounts.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top visit days
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = new Map<number, number>();
    visits.forEach(visit => {
      const dayOfWeek = visit.visitedAt.getDay();
      dayCounts.set(dayOfWeek, (dayCounts.get(dayOfWeek) || 0) + 1);
    });
    const topVisitDays = Array.from(dayCounts.entries())
      .map(([dayOfWeek, visits]) => ({
        dayOfWeek,
        dayName: dayNames[dayOfWeek],
        visits,
      }))
      .sort((a, b) => b.visits - a.visits);

    return {
      totalViews,
      totalClicks,
      totalVisits,
      clickThroughRate,
      visitConversionRate,
      overallConversionRate,
      visitsBySource,
      averageTimeToVisit,
      repeatVisitorRate,
      estimatedRevenue,
      costPerVisit,
      returnOnInvestment,
      dailyVisits,
      peakVisitTimes,
      topVisitDays,
    };
  }

  /**
   * Get visit details for a bar
   */
  static async getVisitDetails(barId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const visits = await prisma.barVisit.findMany({
      where: {
        barId,
        visitedAt: { gte: startDate },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { visitedAt: 'desc' },
    });

    return visits;
  }
}
