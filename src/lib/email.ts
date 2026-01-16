import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY || "";
const resendFrom = process.env.RESEND_FROM || "BarLink360 <noreply@barlink360.com>";

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
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
  });
}
