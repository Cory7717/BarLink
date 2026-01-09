import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import EventsClient from './EventsClient';

export default async function EventsPage({
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
      events: {
        orderBy: [{ startDate: 'asc' }, { startTime: 'asc' }],
      },
    },
  });

  if (!bar) {
    redirect('/dashboard');
  }

  // Verify ownership
  if (bar.owner.email !== session.user.email) {
    redirect('/dashboard');
  }

  const serializedBar = {
    id: bar.id,
    name: bar.name,
    events: bar.events.map((e) => ({
      ...e,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate ? e.endDate.toISOString() : null,
    })),
  };

  return <EventsClient bar={serializedBar} />;
}
