import crypto from "crypto";
import { prisma } from "@/lib/prisma";

type ResetEmailConfig = {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
};

function getEmailConfig(): ResetEmailConfig | null {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "";
  const fromEmail = process.env.SMTP_FROM || smtpUser || "noreply@BarLink360.com";

  if (!smtpUser || !smtpPass) {
    return null;
  }

  return { smtpHost, smtpPort, smtpUser, smtpPass, fromEmail };
}

function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || process.env.RENDER_EXTERNAL_URL || "";
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createOwnerPasswordReset(ownerId: string, email: string) {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("Missing base URL configuration");
  }

  const emailConfig = getEmailConfig();
  if (!emailConfig) {
    throw new Error("Email delivery is not configured");
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  await prisma.ownerPasswordReset.deleteMany({ where: { ownerId } });
  await prisma.ownerPasswordReset.create({
    data: {
      ownerId,
      tokenHash,
      expiresAt,
    },
  });

  const resetUrl = `${baseUrl}/auth/reset?token=${rawToken}`;
  const subject = "Reset your BarLink360 password";
  const text = `We received a request to reset your BarLink360 password.\n\nReset link: ${resetUrl}\n\nIf you did not request this, you can ignore this email.`;
  const html = `
    <p>We received a request to reset your BarLink360 password.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.default.createTransport({
    host: emailConfig.smtpHost,
    port: emailConfig.smtpPort,
    secure: emailConfig.smtpPort === 465,
    auth: {
      user: emailConfig.smtpUser,
      pass: emailConfig.smtpPass,
    },
  });

  await transporter.sendMail({
    from: emailConfig.fromEmail,
    to: email,
    subject,
    text,
    html,
  });
}

export async function resetOwnerPassword(token: string, newPasswordHash: string) {
  const tokenHash = hashToken(token);
  const now = new Date();

  const reset = await prisma.ownerPasswordReset.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: now },
    },
  });

  if (!reset) {
    throw new Error("Invalid or expired reset link");
  }

  await prisma.owner.update({
    where: { id: reset.ownerId },
    data: { password: newPasswordHash },
  });

  await prisma.ownerPasswordReset.update({
    where: { id: reset.id },
    data: { usedAt: now },
  });
}
