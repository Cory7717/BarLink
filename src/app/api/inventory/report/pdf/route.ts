import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateInventoryPDF, InventoryReportData } from '@/lib/pdfGenerator';
import { subDays, format } from 'date-fns';

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const owner = await prisma.owner.findUnique({
      where: { email: session.user.email },
    });

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const barId = searchParams.get('barId');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (!barId) {
      return NextResponse.json({ error: 'Missing barId parameter' }, { status: 400 });
    }

    // Verify bar ownership
    const bar = await prisma.bar.findFirst({
      where: {
        id: barId,
        ownerId: owner.id,
      },
    });

    if (!bar) {
      return NextResponse.json({ error: 'Bar not found or access denied' }, { status: 403 });
    }

    // Parse date range (default: last 30 days)
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam ? new Date(startDateParam) : subDays(endDate, 30);

    // Fetch inventory items with related data
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: {
        barId,
        isActive: true,
      },
      include: {
        shiftUsageItems: {
          where: {
            shiftUsage: {
              shiftTime: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
          include: {
            shiftUsage: true,
          },
        },
        snapshotItems: {
          where: {
            snapshot: {
              snapshotDate: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
          include: {
            snapshot: true,
          },
          orderBy: {
            snapshot: {
              snapshotDate: 'desc',
            },
          },
        },
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    // Fetch shift usage summary
    const shiftUsages = await prisma.shiftUsage.findMany({
      where: {
        barId,
        shiftTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
          },
        },
      },
      orderBy: {
        shiftTime: 'asc',
      },
    });

    // Calculate metrics
    let totalStartValue = 0;
    let totalEndValue = 0;
    let totalUsageValue = 0;
    const details: InventoryReportData['details'] = [];
    const exceptions: InventoryReportData['exceptions'] = [];

    inventoryItems.forEach((item) => {
      const costPerBottle = item.costPerBottle ? parseFloat(item.costPerBottle.toString()) : 0;
      const costPerMl = item.bottleSizeMl > 0 ? costPerBottle / item.bottleSizeMl : 0;

      // Calculate usage from shift logs
      const totalUsedQty = item.shiftUsageItems.reduce(
        (sum, usage) => sum + parseFloat(usage.quantityUsed.toString()),
        0
      );

      // Get latest snapshot quantity
      const latestSnapshot = item.snapshotItems[0];
      const physicalQty = latestSnapshot ? parseFloat(latestSnapshot.quantityOnHand.toString()) : null;

      // Calculate expected ending quantity
      const startQty = item.startingQtyBottles;
      const endingQty = startQty - totalUsedQty;

      // Calculate variance
      const varianceQty = physicalQty !== null ? physicalQty - endingQty : null;
      const varianceValue = varianceQty !== null ? varianceQty * costPerBottle : null;

      const currentValue = (physicalQty ?? endingQty) * costPerBottle;

      totalStartValue += startQty * costPerBottle;
      totalEndValue += currentValue;
      totalUsageValue += totalUsedQty * costPerBottle;

      details.push({
        category: item.category || 'Other',
        name: item.name,
        sizeMl: item.bottleSizeMl,
        costPerBottle,
        costPerMl,
        startQty,
        receivedQty: 0, // TODO: Add receiving functionality
        usedQty: totalUsedQty,
        endingQty,
        physicalQty,
        varianceQty,
        varianceValue,
        currentValue,
      });

      // Generate exceptions
      if (endingQty < 2) {
        exceptions.push({
          type: 'low_stock',
          itemName: item.name,
          details: `Only ${endingQty.toFixed(1)} bottles remaining`,
          value: endingQty,
        });
      }

      if (varianceValue && Math.abs(varianceValue) > 50) {
        exceptions.push({
          type: 'high_variance',
          itemName: item.name,
          details: `Variance of $${Math.abs(varianceValue).toFixed(2)}`,
          value: Math.abs(varianceValue),
        });
      }

      if (!item.costPerBottle) {
        exceptions.push({
          type: 'missing_data',
          itemName: item.name,
          details: 'Missing cost per bottle',
        });
      }
    });

    // Calculate usage summary by day
    const usageSummaryMap = new Map<string, { bottlesUsed: number; mlUsed: number; costUsed: number }>();

    shiftUsages.forEach((shift) => {
      const dateKey = format(shift.shiftTime, 'yyyy-MM-dd');
      const existing = usageSummaryMap.get(dateKey) || { bottlesUsed: 0, mlUsed: 0, costUsed: 0 };

      shift.items.forEach((item) => {
        const qty = parseFloat(item.quantityUsed.toString());
        const ml = qty * item.inventoryItem.bottleSizeMl;
        const cost = qty * (item.inventoryItem.costPerBottle ? parseFloat(item.inventoryItem.costPerBottle.toString()) : 0);

        existing.bottlesUsed += qty;
        existing.mlUsed += ml;
        existing.costUsed += cost;
      });

      usageSummaryMap.set(dateKey, existing);
    });

    const usageSummary = Array.from(usageSummaryMap.entries())
      .map(([date, data]) => ({
        date: format(new Date(date), 'MMM dd, yyyy'),
        ...data,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Top cost items
    const topCostItems = [...details]
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 5)
      .map((item) => ({ name: item.name, value: item.currentValue }));

    // Top usage items
    const topUsageItems = [...details]
      .sort((a, b) => b.usedQty - a.usedQty)
      .slice(0, 5)
      .map((item) => ({ name: item.name, usage: item.usedQty }));

    const totalVariance = details.reduce((sum, item) => sum + (item.varianceValue || 0), 0);

    // Build report data
    const reportData: InventoryReportData = {
      header: {
        barName: bar.name,
        address: bar.address,
        city: bar.city,
        state: bar.state,
        dateRange: { start: startDate, end: endDate },
        preparedBy: owner.name,
        preparedByEmail: owner.email,
      },
      summary: {
        startInventoryValue: totalStartValue,
        endInventoryValue: totalEndValue,
        totalUsage: totalUsageValue,
        totalPurchases: 0, // TODO: Add receiving functionality
        totalVariance,
        pourCostPct: null, // TODO: Calculate from sales data
        topCostItems,
        topUsageItems,
      },
      details,
      usageSummary,
      exceptions: exceptions.sort((a, b) => (b.value || 0) - (a.value || 0)),
    };

    // Generate PDF
    const pdfBuffer = await generateInventoryPDF(reportData);

    // Generate filename
    const filename = `BarLink_InventoryReport_${bar.slug}_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.pdf`;

    // Return PDF
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
