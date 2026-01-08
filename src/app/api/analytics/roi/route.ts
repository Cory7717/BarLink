import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ROIAnalyticsService } from '@/lib/roiAnalytics';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const barId = searchParams.get('barId');
    const days = parseInt(searchParams.get('days') || '30');
    const subscriptionCost = parseFloat(searchParams.get('subscriptionCost') || '29');
    const averageCheckSize = parseFloat(searchParams.get('averageCheckSize') || '25');

    if (!barId) {
      return NextResponse.json({ error: 'Bar ID is required' }, { status: 400 });
    }

    // Verify owner owns this bar
    const owner = await prisma.owner.findUnique({
      where: { email: session.user.email },
      include: {
        bars: {
          where: { id: barId },
          select: { id: true },
        },
      },
    });

    if (!owner || owner.bars.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const metrics = await ROIAnalyticsService.calculateROI({
      barId,
      days,
      subscriptionCost,
      averageCheckSize,
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('ROI analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate ROI metrics' },
      { status: 500 }
    );
  }
}
