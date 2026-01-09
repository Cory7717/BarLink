import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    await requireAdmin();
    const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ codes });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { code, description, maxRedemptions, grantPlan, grantMonths } = body || {};
    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    const created = await prisma.promoCode.create({
      data: {
        code: String(code).trim().toUpperCase(),
        description: description || null,
        maxRedemptions: maxRedemptions ?? null,
        grantPlan: grantPlan ?? null,
        grantMonths: grantMonths ?? null,
      },
    });
    return NextResponse.json({ code: created });
  } catch {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
