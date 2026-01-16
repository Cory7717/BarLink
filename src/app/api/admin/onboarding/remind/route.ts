import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { notifyOwnerEmail } from "@/lib/adminNotifications";
import { sendOneSignalNotification } from "@/lib/onesignalServer";

const STEP_THRESHOLDS = [60 * 60 * 1000, 24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000]; // 1h, 1d, 3d

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  const token = req.headers.get("x-cron-token");
  const envToken = process.env.CRON_SECRET;

  if (!isAdminEmail(email) && (!envToken || token !== envToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const bars = await prisma.bar.findMany({
    where: {
      trialStartedAt: { not: null },
      onboardingComplete: false,
      onboardingReminderStep: { lt: STEP_THRESHOLDS.length },
    },
    include: {
      owner: { select: { id: true, email: true, name: true } },
    },
    take: 100,
  });

  let sent = 0;
  for (const bar of bars) {
    if (!bar.trialStartedAt || !bar.owner?.id) continue;
    const step = bar.onboardingReminderStep || 0;
    if (step >= STEP_THRESHOLDS.length) continue;
    const threshold = STEP_THRESHOLDS[step];
    const elapsed = now - bar.trialStartedAt.getTime();
    if (elapsed < threshold) continue;

    const subject = "Finish your BarLink360 setup";
    const body = [
      `You're on a free trial. Finish setup to get discovered:`,
      "- Add at least one offering or event",
      "- Upload a logo/photo",
      "- Set a check-in perk (QR reward)",
      "",
      "Dashboard: https://barlink360.com/dashboard",
    ].join("\n");

    try {
      await notifyOwnerEmail(bar.owner.id, subject, body);
      // Optional push via OneSignal if external_id is email and user opted in
      if (bar.owner.email) {
        void sendOneSignalNotification(bar.owner.email.toLowerCase(), "Finish your setup", "Add offerings/events, logo, and QR perk to maximize visibility.", "https://barlink360.com/dashboard");
      }
      await prisma.bar.update({
        where: { id: bar.id },
        data: { onboardingReminderStep: step + 1 },
      });
      sent += 1;
    } catch (err) {
      console.warn("Onboarding reminder failed for bar", bar.id, err);
    }
  }

  return NextResponse.json({ sent });
}
