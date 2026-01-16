import { NextRequest, NextResponse } from "next/server";
import { requireAdminEmail } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/adminAudit";

async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
  const SMTP_PORT = process.env.SMTP_PORT || "587";
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const FROM_EMAIL = process.env.SMTP_FROM || SMTP_USER || "noreply@BarLink360.com";
  const smtpConfigured = Boolean(SMTP_USER && SMTP_PASS);

  if (!smtpConfigured) {
    console.warn("SMTP not configured; skipping email send", { to, subject });
    return { sent: false };
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.default.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: SMTP_PORT === "465",
    requireTLS: SMTP_PORT === "587",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transporter.sendMail({ from: FROM_EMAIL, to, subject, text, html: html || text });
  return { sent: true };
}

export async function POST(req: NextRequest) {
  try {
    const adminEmail = await requireAdminEmail();
    const { subscriptionId, message } = await req.json();
    if (!subscriptionId) {
      return NextResponse.json({ error: "subscriptionId required" }, { status: 400 });
    }
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { owner: { select: { email: true, name: true } } },
    });
    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const bodyText =
      message ||
      `Hi ${subscription.owner.name || ""}, we could not process your BarLink360 subscription. Please update payment to stay active.`;

    const emailResult = await sendEmail(
      subscription.owner.email,
      "Action needed: BarLink360 subscription payment issue",
      bodyText
    );

    await logAdminAction({
      action: "admin.notifyFailedSubscription",
      entityType: "subscription",
      entityId: subscriptionId,
      after: { message: bodyText, sent: emailResult.sent, admin: adminEmail },
    });

    return NextResponse.json({ ok: true, sent: emailResult.sent });
  } catch (error) {
    console.error("Admin notify failed sub error:", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}
