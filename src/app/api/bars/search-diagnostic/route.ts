import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Diagnostic endpoint to help debug why bars don't appear in search
 * Call: GET /api/bars/search-diagnostic?barId=YOUR_BAR_ID
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const barId = searchParams.get("barId");

    if (!barId) {
      return NextResponse.json({ error: "barId query parameter required" }, { status: 400 });
    }

    const bar = await prisma.bar.findUnique({
      where: { id: barId },
      include: {
        owner: {
          include: {
            subscription: true,
          },
        },
        offerings: true,
        events: true,
        barLicenses: true,
      },
    });

    if (!bar) {
      return NextResponse.json({ error: "Bar not found" }, { status: 404 });
    }

    const issues: string[] = [];

    if (bar.isPublished) {
      issues.push("OK: Bar is published");
    } else if (bar.owner.allowFreeListings) {
      issues.push("OK: Free listings enabled for owner");
    } else {
      issues.push("ERR: Bar is NOT published - active subscription or free listings required");
    }

    if (!bar.isActive) {
      issues.push("ERR: Bar is NOT active");
    } else {
      issues.push("OK: Bar is active");
    }

    if (bar.owner.subscription) {
      if (bar.owner.subscription.status === "ACTIVE") {
        issues.push("OK: Subscription is ACTIVE");
      } else {
        issues.push(`WARN: Subscription status is ${bar.owner.subscription.status}`);
      }
    } else {
      issues.push("WARN: No subscription found");
    }

    if (!bar.cityNormalized) {
      issues.push("ERR: cityNormalized is empty - required for search");
    } else {
      issues.push(`OK: cityNormalized: "${bar.cityNormalized}"`);
    }

    const activeOfferings = bar.offerings.filter((o) => o.isActive);
    if (activeOfferings.length === 0) {
      issues.push("WARN: No active offerings - add at least one to appear in search");
    } else {
      issues.push(`OK: ${activeOfferings.length} active offering(s)`);
      activeOfferings.forEach((o) => {
        issues.push(`   - ${o.customTitle || o.category} (day ${o.dayOfWeek})`);
      });
    }

    const activeEvents = bar.events.filter((e) => e.isActive);
    if (activeEvents.length === 0) {
      issues.push("INFO: No active events (optional, but helps with search)");
    } else {
      issues.push(`OK: ${activeEvents.length} active event(s)`);
    }

    const canAppearInSearch =
      (bar.isPublished || bar.owner.allowFreeListings) &&
      bar.isActive &&
      (bar.owner.subscription?.status === "ACTIVE" || bar.owner.allowFreeListings) &&
      bar.cityNormalized &&
      activeOfferings.length > 0;

    return NextResponse.json({
      barId: bar.id,
      barName: bar.name,
      canAppearInSearch,
      issues,
      details: {
        isPublished: bar.isPublished,
        isActive: bar.isActive,
        subscriptionStatus: bar.owner.subscription?.status || "NONE",
        allowFreeListings: bar.owner.allowFreeListings,
        cityNormalized: bar.cityNormalized,
        activeOfferingCount: activeOfferings.length,
        activeEventCount: activeEvents.length,
        latitude: bar.latitude,
        longitude: bar.longitude,
        searchAppearances: bar.searchAppearances,
      },
    });
  } catch (error) {
    console.error("Diagnostic error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
