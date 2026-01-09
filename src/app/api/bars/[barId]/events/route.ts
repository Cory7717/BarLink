import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ barId: string }> }
) {
  try {
    const { barId } = await params;
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bar = await prisma.bar.findUnique({ where: { id: barId }, include: { owner: true } });
    if (!bar || bar.owner.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const events = await prisma.event.findMany({
      where: { barId },
      orderBy: [{ startDate: 'asc' }, { startTime: 'asc' }],
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ barId: string }> }
) {
  try {
    const { barId } = await params;
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bar = await prisma.bar.findUnique({ where: { id: barId }, include: { owner: true } });
    if (!bar || bar.owner.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, category, startDate, endDate, startTime, endTime, isSpecial, isActive } = body;

    if (!title || !startDate || !startTime) {
      return NextResponse.json({ error: 'Title, start date, and start time are required' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        barId,
        title,
        description: description || null,
        category: category || title,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        startTime,
        endTime: endTime || null,
        isActive: isActive ?? true,
        isSpecial: isSpecial ?? false,
        isNew: false,
        tags: category ? [category] : [],
      },
    });

    // Serialize dates to strings for JSON response
    const serializedEvent = {
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate ? event.endDate.toISOString() : null,
    };

    return NextResponse.json(serializedEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
