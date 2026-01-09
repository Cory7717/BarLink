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

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const day = searchParams.get('day');
    const activity = searchParams.get('activity');
    const city = searchParams.get('city');
    const special = searchParams.get('special') === 'true';
    const happeningNow = searchParams.get('happeningNow') === 'true';
    const distance = searchParams.get('distance') ? Number(searchParams.get('distance')) : null;
    const userLatitude = searchParams.get('userLatitude') ? Number(searchParams.get('userLatitude')) : null;
    const userLongitude = searchParams.get('userLongitude') ? Number(searchParams.get('userLongitude')) : null;

    if (!day || !activity) {
      return NextResponse.json({ error: 'Day and activity are required' }, { status: 400 });
    }

    const dayInt = parseInt(day);
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const activityLower = activity.toLowerCase();

    const categories = await prisma.activityCategory.findMany({
      select: { name: true, displayName: true },
    });

    const categoryLabelMap = new Map(categories.map((category) => [category.name, category.displayName]));
    const matchedCategory = categories.find(
      (category) =>
        category.name === activityLower ||
        category.displayName.toLowerCase() === activityLower
    );

    const activityValues = new Set<string>([activity]);
    if (matchedCategory) {
      activityValues.add(matchedCategory.name);
      activityValues.add(matchedCategory.displayName);
    }

    const activityFilters = Array.from(activityValues).map((value) => ({
      category: { equals: value, mode: "insensitive" as const },
    }));

    // Build query filters - must be active and either published or allowed via free listings
    const baseBarFilter: Record<string, unknown> = {
      isActive: true,
      OR: [{ isPublished: true }, { owner: { allowFreeListings: true } }],
    };

    // Add city filter if provided
    if (city && city.trim()) {
      baseBarFilter.cityNormalized = city.toLowerCase().trim();
    }

    // Find bars with matching offerings for specific activity + day
    let bars = await prisma.bar.findMany({
      where: {
        ...baseBarFilter,
        offerings: {
          some: {
            isActive: true,
            dayOfWeek: dayInt,
            OR: activityFilters.length > 0 ? activityFilters : [{ category: activity }],
            ...(special ? { isSpecial: true } : {}),
            ...(happeningNow ? {
              startTime: { lte: currentTime },
              endTime: { gte: currentTime },
            } : {}),
          },
        },
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

    // Fallback: if no offering matches, try finding bars with events matching the activity
    if (bars.length === 0) {
      bars = await prisma.bar.findMany({
        where: {
          ...baseBarFilter,
          events: {
          some: {
            isActive: true,
            OR: activityFilters.length > 0 ? activityFilters : [{ category: activity }],
            startDate: { lte: now },
            ...(special ? { isSpecial: true } : {}),
          },
        },
        },
        include: {
          offerings: true,
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
    }

    // Final fallback: return ALL published bars in the city (for new bars without offerings/events yet)
    if (bars.length === 0 && city && city.trim()) {
      bars = await prisma.bar.findMany({
        where: {
          ...baseBarFilter,
        },
        include: {
          offerings: true,
          events: true,
        },
        take: 50,
      }) as BarWithRelations[];
    }

    // Filter by distance if provided
    if (distance && userLatitude !== null && userLongitude !== null) {
      bars = bars.filter((bar) => {
        const dist = calculateDistance(userLatitude, userLongitude, bar.latitude, bar.longitude);
        return dist <= distance;
      });
    }

    // Increment search appearance count
    if (bars.length > 0) {
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
    }

    const results = bars.map((bar: BarWithRelations) => {
      let distance_miles: number | undefined;
      if (distance && userLatitude !== null && userLongitude !== null) {
        distance_miles = calculateDistance(userLatitude, userLongitude, bar.latitude, bar.longitude);
      }

      return {
        id: bar.id,
        name: bar.name,
        slug: bar.slug,
        address: bar.address,
        city: bar.city,
        latitude: bar.latitude,
        longitude: bar.longitude,
        todayOfferings: bar.offerings.map((o) => o.customTitle || categoryLabelMap.get(o.category) || o.category),
        hasSpecial: bar.offerings.some((o) => o.isSpecial) || bar.events.some((e) => e.isSpecial),
        hasNew: bar.offerings.some((o) => o.isNew) || bar.events.some((e) => e.isNew),
        ...(distance_miles !== undefined && { distance: distance_miles }),
      };
    }).sort((a, b) => {
      // Sort by distance if provided
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });

    return NextResponse.json({ bars: results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
