import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BadgeService } from '@/lib/badgeService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ barId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barId } = await params;
    const progress = await BadgeService.getBadgeProgress(barId);

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error fetching badge progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badge progress' },
      { status: 500 }
    );
  }
}
