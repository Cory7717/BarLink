import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ barId: string; id: string }> }
) {
  try {
    const { barId, id } = await params;
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

    const parsedStartDate =
      startDate !== undefined ? new Date(startDate) : undefined;
    if (parsedStartDate && Number.isNaN(parsedStartDate.getTime())) {
      return NextResponse.json({ error: 'Invalid start date' }, { status: 400 });
    }

    const parsedEndDate =
      endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined;
    if (parsedEndDate instanceof Date && Number.isNaN(parsedEndDate.getTime())) {
      return NextResponse.json({ error: 'Invalid end date' }, { status: 400 });
    }

    const event = await prisma.event.update({
      where: { id, barId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(parsedStartDate !== undefined && { startDate: parsedStartDate }),
        ...(parsedEndDate !== undefined && { endDate: parsedEndDate }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(isSpecial !== undefined && { isSpecial }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // Serialize dates to strings for JSON response
    const serializedEvent = {
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate ? event.endDate.toISOString() : null,
    };

    return NextResponse.json(serializedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ barId: string; id: string }> }
) {
  try {
    const { barId, id } = await params;
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bar = await prisma.bar.findUnique({ where: { id: barId }, include: { owner: true } });
    if (!bar || bar.owner.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.event.delete({ where: { id, barId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
