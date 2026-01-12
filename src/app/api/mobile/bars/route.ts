import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMobileRequest } from "@/lib/mobileAuth";

export async function GET(req: Request) {
  try {
    const claims = await verifyMobileRequest(req);
    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bars = await prisma.bar.findMany({
      where: { ownerId: claims.sub },
      select: { id: true, name: true, address: true, city: true, state: true },
    });

    return NextResponse.json({ bars });
  } catch (error) {
    console.error("Mobile bars error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
