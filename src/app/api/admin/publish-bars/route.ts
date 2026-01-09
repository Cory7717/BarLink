import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const SUPER_ADMIN = 'coryarmer@gmail.com';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email || session.user.email !== SUPER_ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barId, cityFilter } = await req.json();

    if (barId) {
      // Publish specific bar
      const bar = await prisma.bar.update({
        where: { id: barId },
        data: { isPublished: true, publishedAt: new Date() },
      });

      // Also normalize city if needed
      if (bar.city && !bar.cityNormalized) {
        await prisma.bar.update({
          where: { id: barId },
          data: {
            cityNormalized: bar.city.toLowerCase().trim(),
            neighborhoodNormalized: bar.neighborhood ? bar.neighborhood.toLowerCase().trim() : undefined,
          },
        });
      }

      return NextResponse.json({ message: 'Bar published', bar });
    }

    if (cityFilter) {
      // Publish all bars in a city
      const bars = await prisma.bar.updateMany({
        where: { city: { mode: 'insensitive', equals: cityFilter } },
        data: { isPublished: true, publishedAt: new Date() },
      });

      // Fix cityNormalized field for all bars in this city
      const allBars = await prisma.bar.findMany({
        where: { city: { mode: 'insensitive', equals: cityFilter } },
      });

      for (const bar of allBars) {
        if (!bar.cityNormalized) {
          await prisma.bar.update({
            where: { id: bar.id },
            data: {
              cityNormalized: bar.city.toLowerCase().trim(),
              neighborhoodNormalized: bar.neighborhood ? bar.neighborhood.toLowerCase().trim() : undefined,
            },
          });
        }
      }

      return NextResponse.json({ message: `Published ${bars.count} bars in ${cityFilter}` });
    }

    return NextResponse.json({ error: 'barId or cityFilter required' }, { status: 400 });
  } catch (error) {
    console.error('Error publishing bars:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
