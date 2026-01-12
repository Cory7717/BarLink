import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  const owner = await prisma.owner.findUnique({
    where: { email: session.user.email },
    include: { subscription: true },
  });

  if (!owner) {
    return null;
  }

  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-gradient">Settings</h1>
          <p className="text-sm text-slate-300">Manage your account and billing.</p>
        </header>

        <div className="space-y-6">
          <section className="glass-panel rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white">Subscription</h2>
            {owner.subscription ? (
              <>
                <p className="text-sm text-slate-300 mt-1">
                  {owner.subscription.plan.replace("_", " ")} · {owner.subscription.status}
                </p>
                {owner.subscription.currentPeriodEnd && (
                  <p className="text-sm text-slate-400 mt-1">
                    Renews on {new Date(owner.subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href="https://www.paypal.com/myaccount/autopay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary px-4 py-2 text-sm"
                  >
                    Manage in PayPal
                  </a>
                  <form action="/api/subscriptions/cancel" method="post">
                    <button type="submit" className="btn-secondary px-4 py-2 text-sm">
                      Cancel subscription
                    </button>
                  </form>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Cancelling immediately ends publishing; you can restart anytime from Pricing.
                </p>
              </>
            ) : (
              <div className="mt-2">
                <p className="text-sm text-slate-300">No active subscription.</p>
                <Link href="/pricing" className="btn-primary mt-3 inline-flex px-4 py-2 text-sm">
                  View plans
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
