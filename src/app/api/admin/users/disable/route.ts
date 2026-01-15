import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminEmail } from "@/lib/access";
import { logAdminAction } from "@/lib/adminAudit";

export async function POST(req: NextRequest) {
  try {
    await requireAdminEmail();
    const { userId, disabled } = await req.json();
    if (!userId || typeof disabled !== "boolean") {
      return NextResponse.json({ error: "userId and disabled required" }, { status: 400 });
    }
    const before = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, disabled: true } });
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { disabled },
    });
    await logAdminAction({
      action: "admin.disableUser",
      entityType: "user",
      entityId: userId,
      before,
      after: { disabled: updated.disabled },
    });
    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Admin disable user error:", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}
