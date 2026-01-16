import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

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
    const subject = `BarLink360 Category Request: ${category}`;
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

    await sendEmail(TO_EMAIL, subject, text, html);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Category request error:", error);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}
