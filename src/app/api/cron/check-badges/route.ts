import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BadgeService } from '@/lib/badgeService';

// This endpoint should be protected with an API key in production
// Call it via cron job (e.g., Vercel Cron, GitHub Actions, etc.)
export async function POST(request: Request) {
  try {
    // Verify cron secret if set
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Get all bars
    const bars = await prisma.bar.findMany({
      select: { id: true, name: true },
    });

    let totalNewBadges = 0;
    const results = [];

    for (const bar of bars) {
      try {
        const result = await BadgeService.checkAndAwardBadges(bar.id);
        if (result.newBadges.length > 0) {
          results.push({
            barId: bar.id,
            barName: bar.name,
            newBadges: result.newBadges,
          });
          totalNewBadges += result.newBadges.length;
        }
      } catch (error) {
        console.error(`Error checking badges for bar ${bar.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      barsChecked: bars.length,
      totalNewBadges,
      results,
    });
  } catch (error) {
    console.error('Error in badge cron job:', error);
    return NextResponse.json(
      { error: 'Failed to run badge checks' },
      { status: 500 }
    );
  }
}
