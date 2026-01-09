import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_ACTIVITY_CATEGORIES } from "@/lib/activityCategories";

export async function GET() {
  try {
    await prisma.activityCategory.createMany({
      data: DEFAULT_ACTIVITY_CATEGORIES.map((category) => ({
        name: category.name,
        displayName: category.displayName,
        sortOrder: category.sortOrder,
        isActive: true,
      })),
      skipDuplicates: true,
    });

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
