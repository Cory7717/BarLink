import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ownerId = session?.user && typeof session.user === 'object' ? (session.user as { id?: string }).id : undefined;
    
    if (!ownerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const barId = searchParams.get('barId');

    if (!barId) {
      return NextResponse.json({ error: 'Missing barId' }, { status: 400 });
    }

    // Verify ownership
    const bar = await prisma.bar.findFirst({
      where: { id: barId, ownerId },
    });

    if (!bar) {
      return NextResponse.json({ error: 'Bar not found or access denied' }, { status: 403 });
    }

    const alerts = await prisma.varianceAlert.findMany({
      where: { barId },
      include: {
        inventoryItem: {
          select: {
            name: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Fetch variance alerts error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
