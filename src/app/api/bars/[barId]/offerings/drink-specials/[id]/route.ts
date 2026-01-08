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

    const bar = await prisma.bar.findUnique({
      where: { id: barId },
      include: { owner: true },
    });

    if (!bar || bar.owner.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, startTime, endTime, daysOfWeek, active } = body;

    const drinkSpecial = await prisma.drinkSpecial.update({
      where: { id, barId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(daysOfWeek !== undefined && { daysOfWeek }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json(drinkSpecial);
  } catch (error) {
    console.error('Error updating drink special:', error);
    return NextResponse.json(
      { error: 'Failed to update drink special' },
      { status: 500 }
    );
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

    const bar = await prisma.bar.findUnique({
      where: { id: barId },
      include: { owner: true },
    });

    if (!bar || bar.owner.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.drinkSpecial.delete({
      where: { id, barId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting drink special:', error);
    return NextResponse.json(
      { error: 'Failed to delete drink special' },
      { status: 500 }
    );
  }
}
