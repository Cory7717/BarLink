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
    
    const offerings = await prisma.foodOffering.findMany({
      where: { barId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(offerings);
  } catch (error) {
    console.error('Error fetching food offerings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch food offerings' },
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

    const { name, description, specialDays, isSpecial, active } = await request.json();

    const offering = await prisma.foodOffering.create({
      data: {
        barId,
        name,
        description: description || '',
        specialDays: specialDays || [], // Empty means always available
        isSpecial: isSpecial || false,
        active: active !== false
      }
    });

    return NextResponse.json(offering, { status: 201 });
  } catch (error) {
    console.error('Error creating food offering:', error);
    return NextResponse.json(
      { error: 'Failed to create food offering' },
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

    const { id, name, description, specialDays, isSpecial, active } = await request.json();

    const offering = await prisma.foodOffering.update({
      where: { id },
      data: {
        name,
        description,
        specialDays,
        isSpecial,
        active
      }
    });

    return NextResponse.json(offering);
  } catch (error) {
    console.error('Error updating food offering:', error);
    return NextResponse.json(
      { error: 'Failed to update food offering' },
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

    await prisma.foodOffering.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting food offering:', error);
    return NextResponse.json(
      { error: 'Failed to delete food offering' },
      { status: 500 }
    );
  }
}
