import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type AdminAuditPayload = {
  action: string;
  entityType?: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
};

// Records an admin action to the audit log. Swallows errors to avoid blocking primary actions.
export async function logAdminAction(payload: AdminAuditPayload) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return;
    await prisma.adminAudit.create({
      data: {
        adminEmail: email.toLowerCase(),
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId,
        before: payload.before as any,
        after: payload.after as any,
      },
    });
  } catch (err) {
    console.error("Admin audit log failed:", err);
  }
}
