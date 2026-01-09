import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function cleanLabel(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export async function GET() {
  try {
    await requireAdmin();
    const categories = await prisma.activityCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
    });
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const rawName = cleanLabel(String(body.name || body.displayName || ""));
    const displayName = cleanLabel(String(body.displayName || rawName));
    const name = normalizeName(rawName);
    const icon = body.icon ? cleanLabel(String(body.icon)) : null;
    const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;

    if (!name || !displayName) {
      return NextResponse.json({ error: "Name and display name required" }, { status: 400 });
    }

    const created = await prisma.activityCategory.create({
      data: { name, displayName, icon, sortOrder, isActive },
    });

    return NextResponse.json({ category: created });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const id = String(body.id || "").trim();
    if (!id) {
      return NextResponse.json({ error: "Category id required" }, { status: 400 });
    }

    const data: {
      name?: string;
      displayName?: string;
      icon?: string | null;
      sortOrder?: number;
      isActive?: boolean;
    } = {};

    if (body.name !== undefined) {
      const normalized = normalizeName(String(body.name));
      if (!normalized) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      data.name = normalized;
    }

    if (body.displayName !== undefined) {
      const displayName = cleanLabel(String(body.displayName));
      if (!displayName) {
        return NextResponse.json({ error: "Display name cannot be empty" }, { status: 400 });
      }
      data.displayName = displayName;
    }

    if (body.icon !== undefined) {
      const icon = String(body.icon || "").trim();
      data.icon = icon ? icon : null;
    }

    if (body.sortOrder !== undefined) {
      const sortOrder = Number(body.sortOrder);
      if (!Number.isFinite(sortOrder)) {
        return NextResponse.json({ error: "Sort order must be a number" }, { status: 400 });
      }
      data.sortOrder = sortOrder;
    }

    if (body.isActive !== undefined) {
      data.isActive = Boolean(body.isActive);
    }

    const updated = await prisma.activityCategory.update({
      where: { id },
      data,
    });

    return NextResponse.json({ category: updated });
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Category id required" }, { status: 400 });
    }

    await prisma.activityCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
