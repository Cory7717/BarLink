import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAnalyticsEvent } from '@/lib/analytics';
import type { Prisma } from '@/generated/prisma';

type BarWithRelations = Prisma.BarGetPayload<{
  include: {
    offerings: true;
    events: true;
    drinkSpecials: true;
    foodOfferings: true;
    staticOfferings: { select: { name: true } };
  };
}>;

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
    const keyword = (searchParams.get('q') || '').trim().toLowerCase();
    const queryMode: Prisma.QueryMode = "insensitive";

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
          ...(keyword
            ? [
                {
                  offerings: {
                    some: {
                      isActive: true,
                      dayOfWeek: dayInt,
                      OR: [
                        { customTitle: { contains: keyword, mode: queryMode } },
                        { category: { contains: keyword, mode: queryMode } },
                      ],
                    },
                  },
                },
                {
                  events: {
                    some: {
                      isActive: true,
                      OR: [
                        { title: { contains: keyword, mode: queryMode } },
                        { category: { contains: keyword, mode: queryMode } },
                      ],
                    },
                  },
                },
                {
                  staticOfferings: {
                    some: {
                      name: { contains: keyword, mode: queryMode },
                    },
                  },
                },
                {
                  drinkSpecials: {
                    some: {
                      active: true,
                      name: { contains: keyword, mode: queryMode },
                      OR: [{ daysOfWeek: { has: dayInt } }, { daysOfWeek: { isEmpty: true } }],
                    },
                  },
                },
                {
                  foodOfferings: {
                    some: {
                      active: true,
                      name: { contains: keyword, mode: queryMode },
                      OR: [{ specialDays: { has: dayInt } }, { specialDays: { isEmpty: true } }],
                    },
                  },
                },
              ]
            : []),
        ],
      },
      include: {
        offerings: true,
        events: true,
        drinkSpecials: true,
        foodOfferings: true,
        staticOfferings: { select: { name: true } },
      },
      take: 50,
    });

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
          staticOfferings: { select: { name: true } },
        },
        take: 50,
      });
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

      const matchedStatic = keyword
        ? bar.staticOfferings.filter((item) => item.name.toLowerCase().includes(keyword))
        : [];

      const matchedKeywordOfferings = keyword
        ? bar.offerings.filter((offering) => {
            const title = offering.customTitle || "";
            return (
              offering.dayOfWeek === dayInt &&
              (title.toLowerCase().includes(keyword) || offering.category.toLowerCase().includes(keyword))
            );
          })
        : [];

      const matchedKeywordEvents = keyword
        ? bar.events.filter((event) => {
            if (!event.title && !event.category) return false;
            const titleMatch = (event.title || "").toLowerCase().includes(keyword);
            const categoryMatch = (event.category || "").toLowerCase().includes(keyword);
            return eventMatchesDay(event.startDate, dayInt) && (titleMatch || categoryMatch);
          })
        : [];

      const matchedKeywordDrinks = keyword
        ? bar.drinkSpecials.filter(
            (special) =>
              drinkSpecialMatchesDay(special.daysOfWeek, dayInt) &&
              special.name.toLowerCase().includes(keyword)
          )
        : [];

      const matchedKeywordFoods = keyword
        ? bar.foodOfferings.filter(
            (food) =>
              (food.specialDays.length === 0 || food.specialDays.includes(dayInt)) &&
              food.name.toLowerCase().includes(keyword)
          )
        : [];

      const todayOfferings = [
        ...matchedOfferings.map((o) => o.customTitle || categoryLabelMap.get(o.category) || o.category),
        ...(isDrinkSpecial || isFoodSpecial ? [] : matchedEvents.map((e) => e.title || e.category)),
        ...(isDrinkSpecial ? matchedDrinks.map((s) => s.name) : []),
        ...(isFoodSpecial ? matchedFoods.map((f) => f.name) : []),
        ...(matchedStatic.length > 0 ? matchedStatic.map((s) => s.name) : []),
        ...matchedKeywordOfferings.map((o) => o.customTitle || categoryLabelMap.get(o.category) || o.category),
        ...matchedKeywordEvents.map((e) => e.title || e.category),
        ...matchedKeywordDrinks.map((s) => s.name),
        ...matchedKeywordFoods.map((f) => f.name),
      ].filter(Boolean) as string[];

      if (keyword) {
      const keywordMatches =
          bar.name.toLowerCase().includes(keyword) ||
          bar.address.toLowerCase().includes(keyword) ||
          bar.city.toLowerCase().includes(keyword) ||
          (bar.barType ? bar.barType.toLowerCase().includes(keyword) : false) ||
          todayOfferings.some((item) => item.toLowerCase().includes(keyword)) ||
          bar.staticOfferings.some((item) => item.name.toLowerCase().includes(keyword));

        if (!keywordMatches) {
          return null;
        }
      }

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
          barType: bar.barType,
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
