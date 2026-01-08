import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import OfferingsClient from './OfferingsClient';

export default async function OfferingsPage({
  params,
}: {
  params: Promise<{ barId: string }>;
}) {
  const { barId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const bar = await prisma.bar.findUnique({
    where: { id: barId },
    include: {
      owner: true,
      drinkSpecials: {
        orderBy: [{ startTime: 'asc' }, { name: 'asc' }],
      },
      foodOfferings: {
        orderBy: [{ name: 'asc' }],
      },
      staticOfferings: { orderBy: [{ position: 'asc' }] },
    },
  });

  if (!bar) {
    redirect('/dashboard');
  }

  // Verify ownership
  if (bar.owner.email !== session.user.email) {
    redirect('/dashboard');
  }

  return <OfferingsClient bar={bar} />;
}
