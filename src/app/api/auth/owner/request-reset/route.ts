import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOwnerPasswordReset } from "@/lib/passwordReset";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const owner = await prisma.owner.findUnique({
      where: { email: String(email).toLowerCase() },
    });

    if (owner) {
      await createOwnerPasswordReset(owner.id, owner.email);
    }

    return NextResponse.json({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Unable to send reset email. Please try again." },
      { status: 500 }
    );
  }
}
