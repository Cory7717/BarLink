import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminEmail } from "@/lib/access";
import { logAdminAction } from "@/lib/adminAudit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminEmail();
    const { id } = await params;
    const { status, priority, resolution } = await req.json();
    if (!status && !priority && !resolution) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }
    const before = await prisma.supportTicket.findUnique({ where: { id } });
    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(resolution && { resolution }),
      },
    });
    await logAdminAction({
      action: "admin.updateSupportTicket",
      entityType: "supportTicket",
      entityId: id,
      before,
      after: { status: ticket.status, priority: ticket.priority, resolution: ticket.resolution },
    });
    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Admin support PATCH error:", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}
