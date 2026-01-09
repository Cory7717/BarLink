import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const email = session?.user?.email || null;
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const barId = String(body.barId || "").trim();
    const category = String(body.category || "").trim();
    if (!barId || !category) {
      return NextResponse.json({ error: "Missing barId or category" }, { status: 400 });
    }

    const bar = await prisma.bar.findUnique({
      where: { id: barId },
      include: { owner: true },
    });
    if (!bar || bar.owner.email !== email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const request = await prisma.categoryRequest.create({
      data: {
        barId: bar.id,
        ownerId: bar.ownerId,
        requestedByEmail: bar.owner.email,
        requestedByName: bar.owner.name || null,
        category,
      },
    });

    const TO_EMAIL = "coryarmer@gmail.com";
    const subject = `BarPulse Category Request: ${category}`;
    const text = `
Requested by: ${bar.owner.name} (${bar.owner.email})
Bar: ${bar.name} (${bar.city}, ${bar.state})
Category: ${category}
Bar ID: ${bar.id}
Owner ID: ${bar.ownerId}
Request ID: ${request.id}
    `.trim();

    const html = `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color: #0f172a;">New Category Request</h2>
        <p><strong>Requested by:</strong> ${bar.owner.name} (${bar.owner.email})</p>
        <p><strong>Bar:</strong> ${bar.name} (${bar.city}, ${bar.state})</p>
        <p><strong>Category:</strong> ${category}</p>
        <p style="font-size: 12px; color: #64748b;">Bar ID: ${bar.id} · Owner ID: ${bar.ownerId}</p>
      </div>
    `.trim();

    const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
    const SMTP_PORT = process.env.SMTP_PORT || "587";
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
    const FROM_EMAIL = process.env.SMTP_FROM || SMTP_USER || "noreply@barlink.com";

    const smtpConfigured = Boolean(SMTP_USER && SMTP_PASS);
    if (!smtpConfigured && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Email delivery is temporarily unavailable. Please email us directly." },
        { status: 503 }
      );
    }

    if (smtpConfigured) {
      const nodemailer = await import("nodemailer");
      const portNum = parseInt(SMTP_PORT, 10);
      const transporter = nodemailer.default.createTransport({
        host: SMTP_HOST,
        port: portNum,
        secure: portNum === 465,
        requireTLS: portNum !== 465,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"BarPulse Category Request" <${FROM_EMAIL}>`,
        to: TO_EMAIL,
        replyTo: bar.owner.email,
        subject,
        text,
        html,
      });
    } else {
      console.log("=== CATEGORY REQUEST ===");
      console.log("To:", TO_EMAIL);
      console.log("Subject:", subject);
      console.log(text);
      console.log("========================");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Category request error:", error);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}
