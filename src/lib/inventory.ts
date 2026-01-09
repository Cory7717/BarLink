import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { z } from 'zod';

export const inventoryImportItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  bottleSizeMl: z.number().int().positive(),
  startingQtyBottles: z.number().int().nonnegative().default(0),
  costPerBottle: z.number().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

const shiftUsageSchema = z.object({
  barId: z.string().min(1),
  userId: z.string().optional(),
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

const snapshotSchema = z.object({
  barId: z.string().min(1),
  userId: z.string().optional(),
  snapshotDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        inventoryItemId: z.string().min(1),
        quantityOnHand: z.number().nonnegative(),
        notes: z.string().optional(),
      })
    )
    .min(1),
});

export type InventoryImportItem = z.infer<typeof inventoryImportItemSchema>;

export async function importInventoryItems(params: {
  barId: string;
  items: InventoryImportItem[];
  createdById?: string;
  fileName?: string;
  mapping?: unknown;
}) {
  const { barId, createdById, fileName = 'manual', mapping } = params;
  const items = params.items.map((item) => inventoryImportItemSchema.parse(item));

  const created = await prisma.$transaction(async (tx) => {
    const records = await tx.inventoryItem.createMany({
      data: items.map((item) => ({
        barId,
        name: item.name,
        category: item.category,
        bottleSizeMl: item.bottleSizeMl,
        startingQtyBottles: item.startingQtyBottles ?? 0,
        costPerBottle: item.costPerBottle != null ? new Prisma.Decimal(item.costPerBottle) : null,
        isActive: item.isActive ?? true,
      })),
      skipDuplicates: false,
    });

    await tx.inventoryImport.create({
      data: {
        barId,
        fileName,
        rowsImported: records.count,
        mapping: mapping === undefined ? undefined : (mapping as Prisma.InputJsonValue),
        createdById: createdById ?? null,
      },
    });

    return tx.inventoryItem.findMany({
      where: { barId },
      orderBy: { createdAt: 'desc' },
      take: items.length,
    });
  });

  return created;
}

export async function recordShiftUsage(input: z.input<typeof shiftUsageSchema>) {
  const data = shiftUsageSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const shift = await tx.shiftUsage.create({
      data: {
        barId: data.barId,
        userId: data.userId ?? null,
        shiftTime: data.shiftTime ?? new Date(),
        notes: data.notes ?? null,
        items: {
          create: data.items.map((item) => ({
            inventoryItemId: item.inventoryItemId,
            quantityUsed: new Prisma.Decimal(item.quantityUsed),
            notes: item.notes ?? null,
          })),
        },
      },
      include: { items: true },
    });

    // Automatically deduct from PAR inventory
    for (const item of data.items) {
      await tx.inventoryItem.update({
        where: { id: item.inventoryItemId },
        data: {
          startingQtyBottles: {
            decrement: item.quantityUsed,
          },
        },
      });
    }

    return shift;
  });
}

export async function recordSnapshot(input: z.input<typeof snapshotSchema>) {
  const data = snapshotSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const snapshot = await tx.inventorySnapshot.create({
      data: {
        barId: data.barId,
        userId: data.userId ?? null,
        snapshotDate: data.snapshotDate ?? new Date(),
        notes: data.notes ?? null,
        items: {
          create: data.items.map((item) => ({
            inventoryItemId: item.inventoryItemId,
            quantityOnHand: new Prisma.Decimal(item.quantityOnHand),
            notes: item.notes ?? null,
          })),
        },
      },
      include: { items: true },
    });

    return snapshot;
  });
}

export async function ensureBarLicense(barId: string, ownerId: string, priceCents = 2900) {
  return prisma.barLicense.upsert({
    where: { barId },
    create: {
      barId,
      ownerId,
      priceCents,
      status: 'ACTIVE',
    },
    update: {
      ownerId,
      priceCents,
      status: 'ACTIVE',
    },
  });
}
