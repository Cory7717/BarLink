import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { DAYS_OF_WEEK } from '@/lib/constants';

export default async function EventsPage({
  params,
}: {
  params: { barId: string };
}) {
  const { barId } = params;
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

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
              Events & Promotions
            </h1>
            <p className="text-slate-400 mt-2">{bar.name}</p>
          </div>
          <Link
            href={`/dashboard/bar/${bar.id}`}
            className="rounded-lg border border-white/20 bg-white/5 backdrop-blur-md px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-all"
          >
            Back
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
          <p className="text-slate-300 mb-6">
            Choose a day of the week to view and manage events and promotions for that day.
          </p>

          <div className="grid gap-2 mb-8">
            {DAYS_OF_WEEK.map((day) => {
              const dayEvents = bar.events.filter((e) => {
                const d = new Date(e.startDate as unknown as string);
                return d.getDay() === day.value;
              });

              return (
                <Link
                  key={day.value}
                  href={`?day=${day.value}`}
                  className="block rounded-lg border border-slate-700/30 bg-slate-900/30 hover:bg-slate-900/50 p-4 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{day.label}</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        {dayEvents.length === 0
                          ? 'No events scheduled'
                          : `${dayEvents.length} event${dayEvents.length !== 1 ? 's' : ''} scheduled`}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-purple-300">{dayEvents.length}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400 mb-4">
              Coming soon: Direct editing of events and promotions by day of week.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
