import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.activityCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Failed to load event categories:", error);
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
  }
}
