import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { importInventoryItems, ensureBarLicense, inventoryImportItemSchema } from '@/lib/inventory';
import { z } from 'zod';

const importSchema = z.object({
  barId: z.string().min(1),
  fileName: z.string().optional(),
  mapping: z.unknown().optional(),
  items: z.array(inventoryImportItemSchema).min(1),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ownerId = session?.user && typeof session.user === 'object' ? (session.user as { id?: string }).id : undefined;
    if (!ownerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = importSchema.parse(await req.json());

    const bar = await prisma.bar.findUnique({ where: { id: payload.barId }, select: { ownerId: true } });
    if (!bar || bar.ownerId !== ownerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await ensureBarLicense(payload.barId, ownerId);

    const items = await importInventoryItems({
      barId: payload.barId,
      items: payload.items,
      createdById: ownerId,
      fileName: payload.fileName,
      mapping: payload.mapping,
    });

    return NextResponse.json({ items }, { status: 201 });
  } catch (error) {
    console.error('inventory import error', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
