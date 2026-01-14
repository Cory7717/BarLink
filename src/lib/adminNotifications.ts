import { prisma } from "@/lib/prisma";

type EmailConfig = {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
};

function getEmailConfig(): EmailConfig | null {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "";
  const fromEmail = process.env.SMTP_FROM || smtpUser || "noreply@barlink.com";

  if (!smtpUser || !smtpPass) return null;
  return { smtpHost, smtpPort, smtpUser, smtpPass, fromEmail };
}

export async function notifyOwnerEmail(ownerId: string, subject: string, body: string) {
  const owner = await prisma.owner.findUnique({ where: { id: ownerId }, select: { email: true, name: true } });
  if (!owner?.email) return;

  const emailConfig = getEmailConfig();
  if (!emailConfig) {
    console.warn("Email not sent: SMTP config missing");
    return;
  }

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

  const greeting = owner.name ? `Hi ${owner.name},` : "Hi there,";
  const text = `${greeting}\n\n${body}\n\n- BarLink Team`;
  const html = `<p>${greeting}</p><p>${body.replace(/\n/g, "<br/>")}</p><p>- BarLink Team</p>`;

  await transporter.sendMail({
    from: emailConfig.fromEmail,
    to: owner.email,
    subject,
    text,
    html,
  });
}

// Admin signup alert (email or webhook)
export async function notifyAdminSignup(payload: { name: string; email: string }) {
  const webhook = process.env.ADMIN_SIGNUP_WEBHOOK;
  const adminEmail = process.env.ADMIN_SIGNUP_ALERT_EMAIL;

  if (!webhook && !adminEmail) {
    return;
  }

  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `New owner signup: ${payload.name} (${payload.email})`,
          email: payload.email,
          name: payload.name,
          source: "barlink",
        }),
      });
    } catch (err) {
      console.warn("Signup webhook failed", err);
    }
  }

  if (adminEmail) {
    const emailConfig = getEmailConfig();
    if (!emailConfig) {
      console.warn("Admin signup email not sent: SMTP config missing");
      return;
    }
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort,
      secure: emailConfig.smtpPort === 465,
      auth: { user: emailConfig.smtpUser, pass: emailConfig.smtpPass },
    });
    await transporter.sendMail({
      from: emailConfig.fromEmail,
      to: adminEmail,
      subject: "New BarLink owner signup",
      text: `New owner signup:\nName: ${payload.name}\nEmail: ${payload.email}\n`,
    });
  }
}
