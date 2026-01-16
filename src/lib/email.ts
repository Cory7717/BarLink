import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY || "";
// Default to verified domain; can be overridden via RESEND_FROM env.
const resendFrom = process.env.RESEND_FROM || "BarLink360 <noreply@readysetfly.online>";

export async function sendEmail(to: string, subject: string, text: string, html?: string, replyTo?: string) {
  if (!resendKey) {
    throw new Error("RESEND_API_KEY missing");
  }
  const resend = new Resend(resendKey);
  await resend.emails.send({
    from: resendFrom,
    to,
    subject,
    text,
    html,
    reply_to: replyTo,
  });
}
