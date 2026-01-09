import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createOwnerPasswordReset } from "@/lib/passwordReset";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { ownerId, email } = await req.json();

    const owner = ownerId
      ? await prisma.owner.findUnique({ where: { id: ownerId } })
      : email
      ? await prisma.owner.findUnique({ where: { email: String(email).toLowerCase() } })
      : null;

    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    await createOwnerPasswordReset(owner.id, owner.email);

    return NextResponse.json({ message: "Reset link sent" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send reset link";
    console.error("Admin reset error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
