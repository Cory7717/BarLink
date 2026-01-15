import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminEmail } from "@/lib/access";
import { logAdminAction } from "@/lib/adminAudit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ barId: string }> }) {
  try {
    await requireAdminEmail();
    const { barId } = await params;
    const notes = await prisma.adminNote.findMany({
      where: { barId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Admin notes GET error:", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ barId: string }> }) {
  try {
    const adminEmail = await requireAdminEmail();
    const { barId } = await params;
    const { content } = await req.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    const note = await prisma.adminNote.create({
      data: { adminEmail: adminEmail.toLowerCase(), barId, content: content.trim() },
    });

    await logAdminAction({
      action: "admin.addNote",
      entityType: "bar",
      entityId: barId,
      after: { content: note.content },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("Admin notes POST error:", error);
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 });
  }
}
