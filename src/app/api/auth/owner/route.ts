import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const owner = await prisma.owner.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true },
    });

    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    return NextResponse.json({ ownerId: owner.id, owner });
  } catch (error) {
    console.error("Error fetching owner:", error);
    return NextResponse.json({ error: "Failed to fetch owner" }, { status: 500 });
  }
}
