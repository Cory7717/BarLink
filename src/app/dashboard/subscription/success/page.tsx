import { Suspense } from "react";
import Navigation from "@/components/Navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function SuccessContent() {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();
  if (userEmail) {
    // Mark trial started for all bars owned by this email
    const owner = await prisma.owner.findUnique({ where: { email: userEmail }, select: { id: true } });
    if (owner?.id) {
      await prisma.bar.updateMany({
        where: { ownerId: owner.id, trialStartedAt: null },
        data: { trialStartedAt: new Date(), onboardingComplete: false, onboardingReminderStep: 0 },
      });
    }
  }

  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-16 text-center">
        <div className="glass-panel rounded-3xl p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500">
            <svg className="h-8 w-8 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-white">Subscription activated!</h1>
          <p className="mt-3 text-slate-200">
            Your bar is live on BarLink360. Finish setup to maximize visibility.
          </p>
          <div className="mt-6 text-left space-y-2 text-sm text-slate-200">
            <p className="font-semibold text-white">Next steps:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Add at least one offering or drink special.</li>
              <li>Add your first event or promotion.</li>
              <li>Upload a logo/photo and set a check-in perk.</li>
              <li>Generate your QR for patrons.</li>
            </ul>
          </div>
          <a href="/dashboard" className="mt-6 inline-flex btn-primary px-6 py-3 text-sm">
            Go to dashboard
          </a>
        </div>
      </main>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen app-shell"></div>}>
      {/* @ts-expect-error Async Server Component */}
      <SuccessContent />
    </Suspense>
  );
}
