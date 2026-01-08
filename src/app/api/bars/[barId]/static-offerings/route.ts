import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barId: string }> }
) {
  try {
    const { barId } = await params;
    
    const offerings = await prisma.staticOffering.findMany({
      where: { barId },
      orderBy: { position: 'asc' }
    });

    return NextResponse.json(offerings);
  } catch (error) {
    console.error('Error fetching static offerings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch static offerings' },
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

    const { name, icon, description, position } = await request.json();

    // Check if position is valid (0-2)
    if (typeof position !== 'number' || position < 0 || position > 2) {
      return NextResponse.json(
        { error: 'Position must be 0, 1, or 2' },
        { status: 400 }
      );
    }

    // Check if position is already taken
    const existing = await prisma.staticOffering.findFirst({
      where: { barId, position }
    });

    if (existing) {
      return NextResponse.json(
        { error: `Position ${position} is already taken` },
        { status: 400 }
      );
    }

    const offering = await prisma.staticOffering.create({
      data: {
        barId,
        name,
        icon: icon || '🎮',
        description: description || '',
        position
      }
    });

    return NextResponse.json(offering, { status: 201 });
  } catch (error) {
    console.error('Error creating static offering:', error);
    return NextResponse.json(
      { error: 'Failed to create static offering' },
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

    const { id, name, icon, description, position } = await request.json();

    const offering = await prisma.staticOffering.update({
      where: { id },
      data: {
        name,
        icon,
        description,
        position
      }
    });

    return NextResponse.json(offering);
  } catch (error) {
    console.error('Error updating static offering:', error);
    return NextResponse.json(
      { error: 'Failed to update static offering' },
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

    await prisma.staticOffering.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting static offering:', error);
    return NextResponse.json(
      { error: 'Failed to delete static offering' },
      { status: 500 }
    );
  }
}
