import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { QRCodeService } from '@/lib/qrcode';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ barId: string }> }
) {
  try {
    const { barId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify owner owns this bar
    const owner = await prisma.owner.findUnique({
      where: { email: session.user.email },
      include: {
        bars: {
          where: { id: barId },
          select: { id: true, name: true },
        },
      },
    });

    if (!owner || owner.bars.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const bar = owner.bars[0];

    // Generate QR code
    const qrCodeDataUrl = await QRCodeService.generateBarCheckInQR(bar.id, bar.name);

    return NextResponse.json({
      qrCode: qrCodeDataUrl,
      barId: bar.id,
      barName: bar.name,
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
