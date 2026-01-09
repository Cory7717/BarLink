import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Diagnostic endpoint to help debug why bars don't appear in search
 * Call: GET /api/bars/search-diagnostic?barId=YOUR_BAR_ID
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const barId = searchParams.get('barId');

    if (!barId) {
      return NextResponse.json(
        { error: 'barId query parameter required' },
        { status: 400 }
      );
    }

    const bar = await prisma.bar.findUnique({
      where: { id: barId },
      include: {
        owner: true,
        offerings: true,
        events: true,
        barLicenses: true,
        subscription: true,
      },
    });

    if (!bar) {
      return NextResponse.json({ error: 'Bar not found' }, { status: 404 });
    }

    const issues: string[] = [];

    // Check if published
    if (!bar.isPublished) {
      issues.push('❌ Bar is NOT published - owner must have active subscription');
    } else {
      issues.push('✅ Bar is published');
    }

    // Check if active
    if (!bar.isActive) {
      issues.push('❌ Bar is NOT active');
    } else {
      issues.push('✅ Bar is active');
    }

    // Check subscription status
    if (bar.subscription) {
      if (bar.subscription.status === 'ACTIVE') {
        issues.push('✅ Subscription is ACTIVE');
      } else {
        issues.push(`❌ Subscription status is ${bar.subscription.status}`);
      }
    } else {
      issues.push('❌ No subscription found');
    }

    // Check location
    if (!bar.cityNormalized) {
      issues.push('❌ cityNormalized is empty - required for search');
    } else {
      issues.push(`✅ cityNormalized: "${bar.cityNormalized}"`);
    }

    // Check offerings
    const activeOfferings = bar.offerings.filter((o) => o.isActive);
    if (activeOfferings.length === 0) {
      issues.push('❌ No active offerings - add at least one to appear in search');
    } else {
      issues.push(`✅ ${activeOfferings.length} active offering(s)`);
      activeOfferings.forEach((o) => {
        issues.push(`   - ${o.customTitle || o.category} (day ${o.dayOfWeek})`);
      });
    }

    // Check events
    const activeEvents = bar.events.filter((e) => e.isActive);
    if (activeEvents.length === 0) {
      issues.push('⚠️  No active events (optional, but helps with search)');
    } else {
      issues.push(`✅ ${activeEvents.length} active event(s)`);
    }

    const canAppearInSearch =
      bar.isPublished &&
      bar.isActive &&
      bar.subscription?.status === 'ACTIVE' &&
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
        subscriptionStatus: bar.subscription?.status || 'NONE',
        cityNormalized: bar.cityNormalized,
        activeOfferingCount: activeOfferings.length,
        activeEventCount: activeEvents.length,
        latitude: bar.latitude,
        longitude: bar.longitude,
        searchAppearances: bar.searchAppearances,
      },
    });
  } catch (error) {
    console.error('Diagnostic error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
