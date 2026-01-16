import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "./email";

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
  await sendEmail(email, subject, text, html);
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
