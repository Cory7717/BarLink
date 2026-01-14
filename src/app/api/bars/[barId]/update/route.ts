import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBarAccess } from "@/lib/access";

export async function PATCH(req: Request, { params }: { params: Promise<{ barId: string }> }) {
  try {
    const { barId } = await params;
    await requireBarAccess(barId);

    const body = await req.json();
    const data: Record<string, unknown> = {};

    const fields = ["name", "address", "city", "state", "zipCode", "phone", "website", "description", "barType"];
    for (const f of fields) {
      if (body[f] !== undefined) {
        data[f] = body[f] === "" ? null : body[f];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.bar.update({
      where: { id: barId },
      data,
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        phone: true,
        website: true,
        description: true,
        barType: true,
      },
    });

    return NextResponse.json({ bar: updated });
  } catch (error) {
    console.error("Bar update error:", error);
    return NextResponse.json({ error: "Failed to update bar" }, { status: 500 });
  }
}
