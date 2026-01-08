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
    const { name, icon, description, position } = body;

    const staticOffering = await prisma.staticOffering.update({
      where: { id, barId },
      data: {
        ...(name !== undefined && { name }),
        ...(icon !== undefined && { icon }),
        ...(description !== undefined && { description }),
        ...(position !== undefined && { position }),
      },
    });

    return NextResponse.json(staticOffering);
  } catch (error) {
    console.error('Error updating static offering:', error);
    return NextResponse.json(
      { error: 'Failed to update static offering' },
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

    await prisma.staticOffering.delete({
      where: { id, barId },
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
