import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAnalyticsEvent } from '@/lib/analytics';

type OfferingLite = {
  customTitle: string | null;
  category: string;
  isSpecial: boolean;
  isNew: boolean;
  dayOfWeek: number;
  isActive: boolean;
  startTime?: string | null;
  endTime?: string | null;
};

type EventLite = {
  category: string;
  isSpecial: boolean;
  isNew: boolean;
  isActive: boolean;
  startDate: Date;
};

type BarWithRelations = {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  offerings: OfferingLite[];
  events: EventLite[];
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const day = searchParams.get('day');
    const activity = searchParams.get('activity');
    const city = searchParams.get('city');
    const special = searchParams.get('special') === 'true';
    const happeningNow = searchParams.get('happeningNow') === 'true';

    if (!day || !activity) {
      return NextResponse.json({ error: 'Day and activity are required' }, { status: 400 });
    }

    const dayInt = parseInt(day);
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Build query filters
    const barFilter: Record<string, unknown> = {
      isPublished: true,
      isActive: true,
    };

    if (city) {
      barFilter.cityNormalized = city.toLowerCase().trim();
    }

    // Find bars with matching offerings
    const bars = await prisma.bar.findMany({
      where: {
        ...barFilter,
        OR: [
          {
            offerings: {
              some: {
                isActive: true,
                dayOfWeek: dayInt,
                category: activity,
                ...(special ? { isSpecial: true } : {}),
                ...(happeningNow ? {
                  startTime: { lte: currentTime },
                  endTime: { gte: currentTime },
                } : {}),
              },
            },
          },
          {
            events: {
              some: {
                isActive: true,
                category: activity,
                startDate: { lte: now },
                ...(special ? { isSpecial: true } : {}),
              },
            },
          },
        ],
      },
      include: {
        offerings: {
          where: {
            isActive: true,
            dayOfWeek: dayInt,
          },
        },
        events: {
          where: {
            isActive: true,
            startDate: { lte: now },
          },
          take: 3,
        },
      },
      take: 50,
    }) as BarWithRelations[];

    // Increment search appearance count
    await prisma.bar.updateMany({
      where: {
        id: { in: bars.map((b: BarWithRelations) => b.id) },
      },
      data: {
        searchAppearances: { increment: 1 },
      },
    });

    // Log analytics for each bar that appeared in results
    for (const bar of bars) {
      logAnalyticsEvent(bar.id, "search_appear", "search", activity);
    }

    const results = bars.map((bar: BarWithRelations) => ({
      id: bar.id,
      name: bar.name,
      slug: bar.slug,
      address: bar.address,
      city: bar.city,
      latitude: bar.latitude,
      longitude: bar.longitude,
      todayOfferings: bar.offerings.map((o) => o.customTitle || o.category),
      hasSpecial: bar.offerings.some((o) => o.isSpecial) || bar.events.some((e) => e.isSpecial),
      hasNew: bar.offerings.some((o) => o.isNew) || bar.events.some((e) => e.isNew),
    }));

    return NextResponse.json({ bars: results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
