import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signMobileJwt } from "@/lib/mobileAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const owner = await prisma.owner.findUnique({
      where: { email },
      include: { subscription: true },
    });

    if (!owner || !owner.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, owner.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const { token, expiresAt } = await signMobileJwt({
      id: owner.id,
      email: owner.email,
      role: owner.role ?? "owner",
    });

    return NextResponse.json({
      token: {
        accessToken: token,
        expiresAt,
      },
      owner: {
        id: owner.id,
        email: owner.email,
        name: owner.name,
        phone: owner.phone ?? null,
        subscription: owner.subscription
          ? {
              id: owner.subscription.id,
              plan: owner.subscription.plan,
              status: owner.subscription.status,
              currentPeriodEnd: owner.subscription.currentPeriodEnd,
              cancelAtPeriodEnd: owner.subscription.cancelAtPeriodEnd,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Mobile login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
