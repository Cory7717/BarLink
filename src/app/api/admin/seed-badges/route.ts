import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BadgeService } from '@/lib/badgeService';

// Admin-only endpoint to seed badges
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add proper admin check here
    // For now, allowing any logged-in user to seed badges
    
    await BadgeService.seedBadges();

    return NextResponse.json({ 
      success: true,
      message: 'Badges seeded successfully'
    });
  } catch (error) {
    console.error('Error seeding badges:', error);
    return NextResponse.json(
      { error: 'Failed to seed badges', details: String(error) },
      { status: 500 }
    );
  }
}
