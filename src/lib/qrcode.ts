import QRCode from 'qrcode';

export interface BarQRCodeData {
  barId: string;
  barName: string;
  action: 'checkin';
  timestamp: number;
}

export class QRCodeService {
  /**
   * Generate a QR code for bar check-ins
   */
  static async generateBarCheckInQR(barId: string, barName: string): Promise<string> {
    const data: BarQRCodeData = {
      barId,
      barName,
      action: 'checkin',
      timestamp: Date.now(),
    };

    // Create check-in URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const checkInUrl = `${baseUrl}/checkin?data=${encodeURIComponent(JSON.stringify(data))}`;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(checkInUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrCodeDataUrl;
  }

  /**
   * Generate QR code as SVG
   */
  static async generateBarCheckInQRSVG(barId: string, barName: string): Promise<string> {
    const data: BarQRCodeData = {
      barId,
      barName,
      action: 'checkin',
      timestamp: Date.now(),
    };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const checkInUrl = `${baseUrl}/checkin?data=${encodeURIComponent(JSON.stringify(data))}`;

    const qrCodeSVG = await QRCode.toString(checkInUrl, {
      type: 'svg',
      width: 400,
      margin: 2,
    });

    return qrCodeSVG;
  }

  /**
   * Validate QR code data
   */
  static validateQRCodeData(data: string): BarQRCodeData | null {
    try {
      const parsed = JSON.parse(data) as BarQRCodeData;
      
      if (!parsed.barId || !parsed.action || parsed.action !== 'checkin') {
        return null;
      }

      // Check if QR code is not too old (valid for 24 hours)
      const ageInHours = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
      if (ageInHours > 24) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }
}
