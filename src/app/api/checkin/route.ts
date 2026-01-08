import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { QRCodeService } from '@/lib/qrcode';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const { barId, qrData, source = 'qr_code', metadata } = body;

    // Validate QR code data if provided
    if (qrData) {
      const validatedData = QRCodeService.validateQRCodeData(qrData);
      if (!validatedData || validatedData.barId !== barId) {
        return NextResponse.json(
          { error: 'Invalid or expired QR code' },
          { status: 400 }
        );
      }
    }

    // Verify bar exists
    const bar = await prisma.bar.findUnique({
      where: { id: barId },
      select: { id: true, name: true },
    });

    if (!bar) {
      return NextResponse.json(
        { error: 'Bar not found' },
        { status: 404 }
      );
    }

    // Create visit record
    const visit = await prisma.barVisit.create({
      data: {
        barId,
        userId: session?.user?.email ? 
          (await prisma.user.findUnique({ 
            where: { email: session.user.email },
            select: { id: true }
          }))?.id : null,
        source,
        verificationMethod: qrData ? 'qr_scan' : 'manual',
        metadata: metadata || {},
      },
    });

    // Update bar profile views
    await prisma.bar.update({
      where: { id: barId },
      data: { profileViews: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      visit: {
        id: visit.id,
        barName: bar.name,
        visitedAt: visit.visitedAt,
      },
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    );
  }
}
