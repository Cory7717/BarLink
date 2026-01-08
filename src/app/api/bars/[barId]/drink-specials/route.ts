import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barId: string }> }
) {
  try {
    const { barId } = await params;
    
    const specials = await prisma.drinkSpecial.findMany({
      where: { barId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(specials);
  } catch (error) {
    console.error('Error fetching drink specials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drink specials' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ barId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { barId } = await params;
    
    // Verify ownership
    const bar = await prisma.bar.findUnique({
      where: { id: barId },
      include: { owner: true }
    });

    if (!bar || bar.owner.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { name, description, startTime, endTime, daysOfWeek, active } = await request.json();

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: 'Time format must be HH:MM (24-hour)' },
        { status: 400 }
      );
    }

    const special = await prisma.drinkSpecial.create({
      data: {
        barId,
        name,
        description: description || '',
        startTime,
        endTime,
        daysOfWeek: daysOfWeek || [], // Empty means every day
        active: active !== false
      }
    });

    return NextResponse.json(special, { status: 201 });
  } catch (error) {
    console.error('Error creating drink special:', error);
    return NextResponse.json(
      { error: 'Failed to create drink special' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ barId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { barId } = await params;
    
    // Verify ownership
    const bar = await prisma.bar.findUnique({
      where: { id: barId },
      include: { owner: true }
    });

    if (!bar || bar.owner.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id, name, description, startTime, endTime, daysOfWeek, active } = await request.json();

    const special = await prisma.drinkSpecial.update({
      where: { id },
      data: {
        name,
        description,
        startTime,
        endTime,
        daysOfWeek,
        active
      }
    });

    return NextResponse.json(special);
  } catch (error) {
    console.error('Error updating drink special:', error);
    return NextResponse.json(
      { error: 'Failed to update drink special' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ barId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { barId } = await params;
    
    // Verify ownership
    const bar = await prisma.bar.findUnique({
      where: { id: barId },
      include: { owner: true }
    });

    if (!bar || bar.owner.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await request.json();

    await prisma.drinkSpecial.delete({
      where: { id }
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
