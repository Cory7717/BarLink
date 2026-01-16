import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, topic, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const TO_EMAIL = "coryarmer@gmail.com";
    const emailSubject = `BarLink360 Contact Form: ${topic || "General Inquiry"}`;
    const emailText = `
Name: ${name}
Email: ${email}
Topic: ${topic || "Not specified"}

Message:
${message}

---
Sent from BarLink360 Contact Form
    `.trim();

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color: #0891b2;">New Contact Form Submission</h2>
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="margin: 10px 0;"><strong>Topic:</strong> ${topic || "Not specified"}</p>
        </div>
        <div style="margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #64748b; font-size: 12px;">Sent from BarLink360 Contact Form</p>
      </div>
    `.trim();

    await sendEmail(TO_EMAIL, emailSubject, emailText, emailHtml, email);

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been received. We'll get back to you within one business day.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try emailing us directly at coryarmer@gmail.com" },
      { status: 500 }
    );
  }
}
