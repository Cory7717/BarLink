import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BadgeService } from '@/lib/badgeService';

export async function GET(
  request: Request,
  { params }: { params: { barId: string } }
) {
  try {
    const badges = await BadgeService.getBarBadges(params.barId);
    return NextResponse.json({ badges });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { barId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check and award badges for the bar
    const result = await BadgeService.checkAndAwardBadges(params.barId);

    return NextResponse.json({
      success: true,
      newBadges: result.newBadges,
      totalBadges: result.totalBadges,
    });
  } catch (error) {
    console.error('Error checking badges:', error);
    return NextResponse.json(
      { error: 'Failed to check badges' },
      { status: 500 }
    );
  }
}
