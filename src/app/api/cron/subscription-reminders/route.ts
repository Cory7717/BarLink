import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Cron-safe endpoint to send trial ending reminders.
 * Trigger daily (e.g., with an external scheduler) to notify owners whose
 * trial ends within the next 3 days and who have not been reminded yet.
 */
export async function GET() {
  const now = new Date();
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const subs = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      trialEndsAt: { not: null, lte: inThreeDays, gt: now },
      trialReminderSentAt: null,
    },
    include: { owner: true },
  });

  // TODO: integrate real email/SMS provider. For now, log + mark sent.
  for (const sub of subs) {
    console.log(
      `Trial reminder: owner=${sub.owner.email}, trialEndsAt=${sub.trialEndsAt?.toISOString()}`
    );

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { trialReminderSentAt: new Date() },
    });
  }

  return NextResponse.json({ reminded: subs.length });
}
