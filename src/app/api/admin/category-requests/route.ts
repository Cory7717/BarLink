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

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") || "PENDING").toUpperCase();

    const requests = await prisma.categoryRequest.findMany({
      where: { status: status as "PENDING" | "APPROVED" | "REJECTED" },
      include: {
        bar: true,
        owner: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { email } = await requireAdmin();
    const body = await req.json();
    const id = String(body.id || "").trim();
    const action = String(body.action || "").trim().toLowerCase();

    if (!id || !action) {
      return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
    }

    if (action === "approve") {
      const request = await prisma.categoryRequest.findUnique({ where: { id } });
      if (!request) {
        return NextResponse.json({ error: "Request not found" }, { status: 404 });
      }

      const displayName = cleanLabel(String(body.displayName || request.category));
      const name = normalizeName(String(body.name || request.category));
      const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 50;

      const existing = await prisma.activityCategory.findUnique({ where: { name } });
      if (existing) {
        await prisma.activityCategory.update({
          where: { name },
          data: {
            displayName,
            sortOrder,
            isActive: true,
          },
        });
      } else {
        await prisma.activityCategory.create({
          data: {
            name,
            displayName,
            sortOrder,
            isActive: true,
          },
        });
      }

      const updated = await prisma.categoryRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedByEmail: email,
        },
      });

      return NextResponse.json({ request: updated });
    }

    if (action === "reject") {
      const updated = await prisma.categoryRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          reviewedAt: new Date(),
          reviewedByEmail: email,
        },
      });

      return NextResponse.json({ request: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
