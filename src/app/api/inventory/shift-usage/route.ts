import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureBarLicense, recordShiftUsage } from '@/lib/inventory';
import { z } from 'zod';

const payloadSchema = z.object({
  barId: z.string().min(1),
  shiftTime: z.coerce.date().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        inventoryItemId: z.string().min(1),
        quantityUsed: z.number().positive(),
        notes: z.string().optional(),
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ownerId = session?.user?.id;
    if (!ownerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = payloadSchema.parse(await req.json());

    const bar = await prisma.bar.findUnique({ where: { id: body.barId }, select: { ownerId: true } });
    if (!bar || bar.ownerId !== ownerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await ensureBarLicense(body.barId, ownerId);

    const shift = await recordShiftUsage({
      ...body,
      userId: session.user?.id,
    });

    return NextResponse.json({ shift }, { status: 201 });
  } catch (error) {
    console.error('shift usage error', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
