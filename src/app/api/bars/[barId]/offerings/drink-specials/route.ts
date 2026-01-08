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

    const bar = await prisma.bar.findUnique({
      where: { id: barId },
      include: { owner: true },
    });

    if (!bar || bar.owner.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const drinkSpecials = await prisma.drinkSpecial.findMany({
      where: { barId },
      orderBy: [{ startTime: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(drinkSpecials);
  } catch (error) {
    console.error('Error fetching drink specials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drink specials' },
      { status: 500 }
    );
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

    const bar = await prisma.bar.findUnique({
      where: { id: barId },
      include: { owner: true },
    });

    if (!bar || bar.owner.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, startTime, endTime, daysOfWeek, active } = body;

    if (!name || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Name, start time, and end time are required' },
        { status: 400 }
      );
    }

    const drinkSpecial = await prisma.drinkSpecial.create({
      data: {
        barId,
        name,
        description: description || null,
        startTime,
        endTime,
        daysOfWeek: daysOfWeek || [],
        active: active ?? true,
      },
    });

    return NextResponse.json(drinkSpecial, { status: 201 });
  } catch (error) {
    console.error('Error creating drink special:', error);
    return NextResponse.json(
      { error: 'Failed to create drink special' },
      { status: 500 }
    );
  }
}
