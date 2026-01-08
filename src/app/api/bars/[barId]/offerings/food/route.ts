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

    const foodOfferings = await prisma.foodOffering.findMany({
      where: { barId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(foodOfferings);
  } catch (error) {
    console.error('Error fetching food offerings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch food offerings' },
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
    const { name, description, specialDays, isSpecial, active } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const foodOffering = await prisma.foodOffering.create({
      data: {
        barId,
        name,
        description: description || null,
        specialDays: specialDays || [],
        isSpecial: isSpecial ?? false,
        active: active ?? true,
      },
    });

    return NextResponse.json(foodOffering, { status: 201 });
  } catch (error) {
    console.error('Error creating food offering:', error);
    return NextResponse.json(
      { error: 'Failed to create food offering' },
      { status: 500 }
    );
  }
}
