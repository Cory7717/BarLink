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
  category: string | null;
  isSpecial: boolean;
  isNew: boolean;
  isActive: boolean;
  startDate: Date;
  title: string;
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
  drinkSpecials: {
    name: string;
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    active: boolean;
  }[];
  foodOfferings: {
    name: string;
    specialDays: number[];
    isSpecial: boolean;
    active: boolean;
  }[];
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

function eventMatchesDay(eventDate: Date, dayOfWeek: number): boolean {
  return eventDate.getUTCDay() === dayOfWeek;
}

function drinkSpecialMatchesDay(daysOfWeek: number[], dayOfWeek: number): boolean {
  return daysOfWeek.length === 0 || daysOfWeek.includes(dayOfWeek);
}

function normalizeCategoryKey(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
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
    const isDrinkSpecial = activityLower === 'drink-special' || activityLower === 'happy-hour';
    const isFoodSpecial = activityLower === 'food-special';

    const categories = await prisma.activityCategory.findMany({
      select: { name: true, displayName: true },
    });

    const categoryLabelMap = new Map(categories.map((category) => [category.name, category.displayName]));
    const matchedCategory = categories.find(
      (category) =>
        category.name === activityLower ||
        category.displayName.toLowerCase() === activityLower
    );

    const activityValues = new Set<string>([activity, activityLower, normalizeCategoryKey(activityLower)]);
    if (matchedCategory) {
      activityValues.add(matchedCategory.name);
      activityValues.add(matchedCategory.displayName);
      activityValues.add(matchedCategory.displayName.toLowerCase());
      activityValues.add(normalizeCategoryKey(matchedCategory.displayName));
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

    // Find bars with matching offerings, events, or specials for the selected day
    let bars = await prisma.bar.findMany({
      where: {
        ...baseBarFilter,
        OR: [
          {
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
          {
            events: {
              some: {
                isActive: true,
                OR: activityFilters.length > 0 ? activityFilters : [{ category: activity }],
                ...(special ? { isSpecial: true } : {}),
              },
            },
          },
          ...(isDrinkSpecial
            ? [{
                drinkSpecials: {
                  some: {
                    active: true,
                    ...(happeningNow ? {
                      startTime: { lte: currentTime },
                      endTime: { gte: currentTime },
                    } : {}),
                    OR: [{ daysOfWeek: { has: dayInt } }, { daysOfWeek: { isEmpty: true } }],
                  },
                },
              }]
            : []),
          ...(isFoodSpecial
            ? [{
                foodOfferings: {
                  some: {
                    active: true,
                    isSpecial: true,
                    OR: [{ specialDays: { has: dayInt } }, { specialDays: { isEmpty: true } }],
                  },
                },
              }]
            : []),
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
          },
          take: 8,
        },
        drinkSpecials: {
          where: {
            active: true,
          },
        },
        foodOfferings: {
          where: {
            active: true,
          },
        },
      },
      take: 50,
    }) as BarWithRelations[];

    // Final fallback: return ALL published bars in the city (for new bars without offerings/events yet)
    if (bars.length === 0 && city && city.trim()) {
      bars = await prisma.bar.findMany({
        where: {
          ...baseBarFilter,
        },
        include: {
          offerings: true,
          events: true,
          drinkSpecials: true,
          foodOfferings: true,
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

    const results = bars
      .map((bar: BarWithRelations) => {
      let distance_miles: number | undefined;
      if (distance && userLatitude !== null && userLongitude !== null) {
        distance_miles = calculateDistance(userLatitude, userLongitude, bar.latitude, bar.longitude);
      }

      const matchedOfferings = bar.offerings.filter((offering) => {
        const categoryLower = offering.category.toLowerCase();
        const categoryKey = normalizeCategoryKey(offering.category);
        const matchesCategory =
          activityValues.has(offering.category) ||
          activityValues.has(categoryLower) ||
          activityValues.has(categoryKey);

        const matchesSpecial = !special || offering.isSpecial;
        const matchesTime = !happeningNow || (offering.startTime && offering.endTime && offering.startTime <= currentTime && offering.endTime >= currentTime);
        return matchesCategory && matchesSpecial && matchesTime;
      });

      const matchedEvents = bar.events.filter((event) => {
        if (!event.category) return false;
        const categoryLower = event.category.toLowerCase();
        const categoryKey = normalizeCategoryKey(event.category);
        const matchesCategory =
          activityValues.has(event.category) ||
          activityValues.has(categoryLower) ||
          activityValues.has(categoryKey);
        return matchesCategory && eventMatchesDay(event.startDate, dayInt);
      });

      const matchedDrinks = bar.drinkSpecials.filter((special) =>
        drinkSpecialMatchesDay(special.daysOfWeek, dayInt)
      );

      const matchedFoods = bar.foodOfferings.filter((food) =>
        food.isSpecial && (food.specialDays.length === 0 || food.specialDays.includes(dayInt))
      );

      const todayOfferings = [
        ...matchedOfferings.map((o) => o.customTitle || categoryLabelMap.get(o.category) || o.category),
        ...(isDrinkSpecial || isFoodSpecial ? [] : matchedEvents.map((e) => e.title || e.category)),
        ...(isDrinkSpecial ? matchedDrinks.map((s) => s.name) : []),
        ...(isFoodSpecial ? matchedFoods.map((f) => f.name) : []),
      ].filter(Boolean) as string[];

        if (todayOfferings.length === 0) {
          return null;
        }

        return {
          id: bar.id,
          name: bar.name,
          slug: bar.slug,
          address: bar.address,
          city: bar.city,
          latitude: bar.latitude,
          longitude: bar.longitude,
          todayOfferings,
          hasSpecial: bar.offerings.some((o) => o.isSpecial) || bar.events.some((e) => e.isSpecial),
          hasNew: bar.offerings.some((o) => o.isNew) || bar.events.some((e) => e.isNew),
          ...(distance_miles !== undefined && { distance: distance_miles }),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
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
