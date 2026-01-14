import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarAccess } from "@/lib/access";

export async function GET(_: Request, { params }: { params: Promise<{ barId: string }> }) {
  try {
    const { barId } = await params;
    await requireBarAccess(barId);
    const followers = await prisma.barFollower.findMany({
      where: { barId },
      select: { patronEmail: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ followers });
  } catch (error) {
    console.error("Followers GET error", error);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ barId: string }> }) {
  try {
    const { barId } = await params;
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    await prisma.barFollower.upsert({
      where: { barId_patronEmail: { barId, patronEmail: email.toLowerCase() } },
      update: {},
      create: { barId, patronEmail: email.toLowerCase() },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Followers POST error", error);
    return NextResponse.json({ error: "Failed to follow" }, { status: 500 });
  }
}
