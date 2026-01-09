import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const SUPER_ADMIN = 'coryarmer@gmail.com';

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email || session.user.email !== SUPER_ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const barId = searchParams.get('barId');

    if (!barId) {
      return NextResponse.json({ error: 'barId required' }, { status: 400 });
    }

    const bar = await prisma.bar.findUnique({
      where: { id: barId },
      include: {
        owner: { select: { email: true, name: true } },
        offerings: { select: { id: true, category: true, dayOfWeek: true, isActive: true, isSpecial: true, isNew: true } },
        events: { select: { id: true, category: true, isActive: true, isSpecial: true, isNew: true } },
      },
    });

    if (!bar) {
      return NextResponse.json({ error: 'Bar not found' }, { status: 404 });
    }

    const diagnostics = {
      bar: {
        id: bar.id,
        name: bar.name,
        city: bar.city,
        cityNormalized: bar.cityNormalized,
        isActive: bar.isActive,
        isPublished: bar.isPublished,
        publishedAt: bar.publishedAt,
        owner: bar.owner.email,
      },
      eligibility: {
        canAppearInSearch: bar.isPublished && bar.isActive,
        hasValidCity: !!bar.city && !!bar.cityNormalized,
        hasCityNormalized: !!bar.cityNormalized,
        searchReadyIssues: [] as string[],
      },
      content: {
        activeOfferings: bar.offerings.filter(o => o.isActive).length,
        totalOfferings: bar.offerings.length,
        activeEvents: bar.events.filter(e => e.isActive).length,
        totalEvents: bar.events.length,
        offerings: bar.offerings.slice(0, 5),
        events: bar.events.slice(0, 5),
      },
    };

    // Add issues
    if (!bar.isPublished) diagnostics.eligibility.searchReadyIssues.push('Bar is not published - subscribe first');
    if (!bar.isActive) diagnostics.eligibility.searchReadyIssues.push('Bar is not active');
    if (!bar.cityNormalized) diagnostics.eligibility.searchReadyIssues.push('cityNormalized field is empty');
    if (!bar.offerings.some(o => o.isActive)) diagnostics.eligibility.searchReadyIssues.push('No active offerings - add offerings to appear in search');
    if (!bar.events.some(e => e.isActive)) diagnostics.eligibility.searchReadyIssues.push('No active events');

    return NextResponse.json(diagnostics);
  } catch (error) {
    console.error('Error getting bar diagnostics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
