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

    const staticOfferings = await prisma.staticOffering.findMany({
      where: { barId },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json(staticOfferings);
  } catch (error) {
    console.error('Error fetching static offerings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch static offerings' },
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
    const { name, icon, description, position } = body;

    if (!name || !icon) {
      return NextResponse.json(
        { error: 'Name and icon are required' },
        { status: 400 }
      );
    }

    // Max 3 static offerings
    const count = await prisma.staticOffering.count({ where: { barId } });
    if (count >= 3 && position === undefined) {
      return NextResponse.json(
        { error: 'Maximum 3 static offerings allowed' },
        { status: 400 }
      );
    }

    const staticOffering = await prisma.staticOffering.create({
      data: {
        barId,
        name,
        icon,
        description: description || null,
        position: position ?? count,
      },
    });

    return NextResponse.json(staticOffering, { status: 201 });
  } catch (error) {
    console.error('Error creating static offering:', error);
    return NextResponse.json(
      { error: 'Failed to create static offering' },
      { status: 500 }
    );
  }
}
