'use client';

import { useEffect, useState } from 'react';

export default function BarQRCode({ barId }: { barId: string }) {
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const res = await fetch(`/api/qrcode/${barId}`);
        if (res.ok) {
          const data = await res.json();
          setQrCode(data.qrCode);
        }
      } catch (error) {
        console.error('Failed to load QR code:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  }, [barId]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `barpulse-qr-code-${barId}.png`;
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>BarPulse Check-In QR Code</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
                background: white;
              }
              .container {
                text-align: center;
                padding: 2rem;
              }
              h1 {
                color: #10b981;
                margin-bottom: 1rem;
              }
              img {
                border: 10px solid #10b981;
                border-radius: 1rem;
                margin: 2rem 0;
              }
              .instructions {
                max-width: 400px;
                margin: 0 auto;
                text-align: left;
                color: #333;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Check in at our bar!</h1>
              <img src="${qrCode}" alt="QR Code" />
              <div class="instructions">
                <p><strong>How to check in:</strong></p>
                <ol>
                  <li>Open your phone's camera</li>
                  <li>Point it at this QR code</li>
                  <li>Tap the notification to check in</li>
                </ol>
                <p style="margin-top: 2rem; font-size: 0.9em; color: #666;">
                  Powered by <strong>BarPulse</strong>
                </p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
        <p className="text-slate-300">Generating QR code...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-md p-6 shadow-lg">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-emerald-200 mb-2">📱 Patron Check-In QR Code</h2>
        <p className="text-sm text-emerald-100/80 mb-6">
          Display this QR code at your bar for patrons to scan and verify their visit
        </p>

        {qrCode && (
          <div className="inline-block p-4 bg-white rounded-xl mb-6">
            {/* QR code as base64 data URL - no external image optimization needed */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCode} alt="Check-in QR Code" className="w-64 h-64" />
          </div>
        )}

        <div className="flex gap-3 justify-center mb-6">
          <button
            onClick={handleDownload}
            className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-400 hover:to-emerald-500 transition-all"
          >
            📥 Download QR Code
          </button>
          <button
            onClick={handlePrint}
            className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/20 transition-all"
          >
            🖨️ Print QR Code
          </button>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="rounded-lg border border-slate-600/50 bg-slate-800/50 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700/50 transition-all"
          >
            ℹ️ Instructions
          </button>
        </div>

        {showInstructions && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-left">
            <h3 className="font-semibold text-emerald-200 mb-3">How to use your QR code:</h3>
            <ol className="space-y-2 text-sm text-emerald-100/90">
              <li className="flex gap-2">
                <span className="font-bold text-emerald-400">1.</span>
                <span>Download or print the QR code</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-emerald-400">2.</span>
                <span>Display it prominently at your bar (near entrance, bar top, or tables)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-emerald-400">3.</span>
                <span>Encourage patrons to scan it when they arrive</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-emerald-400">4.</span>
                <span>Track verified visits in your ROI dashboard above</span>
              </li>
            </ol>
            <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-200">
                <strong>💡 Pro Tip:</strong> Offer a small incentive (like 5% off) for patrons who check in via QR code. 
                This increases adoption and gives you valuable visit data for ROI tracking!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
