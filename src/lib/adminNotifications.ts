import { prisma } from "@/lib/prisma";
import { sendEmail } from "./email";

export async function notifyOwnerEmail(ownerId: string, subject: string, body: string) {
  const owner = await prisma.owner.findUnique({ where: { id: ownerId }, select: { email: true, name: true } });
  if (!owner?.email) return;

  const greeting = owner.name ? `Hi ${owner.name},` : "Hi there,";
  const text = `${greeting}\n\n${body}\n\n- BarLink360 Team`;
  const html = `<p>${greeting}</p><p>${body.replace(/\n/g, "<br/>")}</p><p>- BarLink360 Team</p>`;

  await sendEmail(owner.email, subject, text, html);
}

export async function notifyAdminSignup(payload: { name: string; email: string }) {
  const adminEmail = process.env.ADMIN_SIGNUP_ALERT_EMAIL;
  if (!adminEmail) return;
  const subject = "New BarLink360 owner signup";
  const text = `New owner signup:\nName: ${payload.name}\nEmail: ${payload.email}\n`;
  await sendEmail(adminEmail, subject, text, text.replace(/\n/g, "<br/>"));
}
