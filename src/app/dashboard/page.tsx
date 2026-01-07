import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch owner and their bars
  const owner = await prisma.owner.findUnique({
    where: { email: session.user.email! },
    include: {
      subscription: true,
      bars: {
        include: {
          offerings: true,
          events: true,
        },
      },
    },
  });

  if (!owner) {
    redirect("/auth/signup");
  }

  const hasActiveSubscription = owner.subscription?.status === "ACTIVE";
  const bar = owner.bars[0]; // For simplicity, assume one bar per owner

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-sm text-slate-300">Welcome back, {owner.name}</p>
          </div>
          <Link
            href="/dashboard/settings"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-800"
          >
            Settings
          </Link>
        </header>

        {!hasActiveSubscription && (
          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <h3 className="font-semibold text-amber-100">Subscription required</h3>
            <p className="text-sm text-amber-200/80">
              Your bar won&apos;t appear in searches until you have an active subscription.
            </p>
            <Link href="/pricing" className="mt-2 inline-flex text-sm font-semibold text-amber-100 hover:text-amber-50">
              View plans →
            </Link>
          </div>
        )}

        {owner.subscription && (
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold">Subscription</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                owner.subscription.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-100" : "bg-red-500/20 text-red-100"
              }`}>
                {owner.subscription.status}
              </span>
              <span className="text-sm text-slate-300">
                {owner.subscription.plan.replace("_", " ")} plan
              </span>
            </div>
            {owner.subscription.currentPeriodEnd && (
              <p className="mt-2 text-sm text-slate-400">
                {owner.subscription.status === "ACTIVE" ? "Renews" : "Expired"} on{" "}
                {new Date(owner.subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
            <a
              href={`https://www.paypal.com/myaccount/autopay`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-sm font-semibold text-emerald-200 hover:text-emerald-100"
            >
              Manage billing on PayPal →
            </a>
          </section>
        )}

        {bar ? (
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{bar.name}</h2>
                <p className="text-sm text-slate-300">
                  {bar.address}, {bar.city}, {bar.state}
                </p>
                <div className="mt-2 flex gap-3 text-sm text-slate-400">
                  <span>{bar.offerings.length} offerings</span>
                  <span>•</span>
                  <span>{bar.events.length} events</span>
                  <span>•</span>
                  <span>{bar.profileViews} views</span>
                </div>
              </div>
              <Link
                href={`/dashboard/bar/${bar.id}`}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Manage bar
              </Link>
            </div>
          </section>
        ) : (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center">
            <p className="text-slate-300">You haven&apos;t created a bar profile yet.</p>
            <Link
              href="/onboarding"
              className="mt-3 inline-flex rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Create bar profile
            </Link>
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="text-sm text-slate-400">Profile views</h3>
            <p className="text-2xl font-bold text-white">{bar?.profileViews || 0}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="text-sm text-slate-400">Search appearances</h3>
            <p className="text-2xl font-bold text-white">{bar?.searchAppearances || 0}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="text-sm text-slate-400">Status</h3>
            <p className="text-lg font-semibold text-white">
              {bar?.isPublished ? (
                <span className="text-emerald-200">Live</span>
              ) : (
                <span className="text-amber-200">Unpublished</span>
              )}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
