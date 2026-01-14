import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const ownerId = url.searchParams.get("ownerId");

    if (!ownerId) {
      return NextResponse.json({ error: "ownerId is required" }, { status: 400 });
    }

    const bars = await prisma.bar.findMany({
      where: { ownerId },
      select: { id: true, name: true, address: true, city: true, state: true, barType: true },
    });

    return NextResponse.json({ bars });
  } catch (error) {
    console.error("Error fetching bars:", error);
    return NextResponse.json({ error: "Failed to fetch bars" }, { status: 500 });
  }
}
