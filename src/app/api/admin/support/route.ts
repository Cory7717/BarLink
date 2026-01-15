import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminEmail } from "@/lib/access";
import { logAdminAction } from "@/lib/adminAudit";

export async function GET(req: NextRequest) {
  try {
    await requireAdminEmail();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const tickets = await prisma.supportTicket.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Admin support GET error:", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminEmail();
    const { barId, userEmail, subject, message, priority } = await req.json();
    if (!userEmail || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const ticket = await prisma.supportTicket.create({
      data: {
        barId: barId || null,
        userEmail,
        subject,
        message,
        priority: priority || "NORMAL",
      },
    });
    await logAdminAction({
      action: "admin.createSupportTicket",
      entityType: "supportTicket",
      entityId: ticket.id,
      after: { subject, barId, priority },
    });
    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error("Admin support POST error:", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}
