"use client";

import { useEffect, useState } from "react";

export default function BarQRCode({ barId }: { barId: string }) {
  const [qrCode, setQrCode] = useState<string>("");
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
        console.error("Failed to load QR code:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  }, [barId]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `barpulse-qr-code-${barId}.png`;
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
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
      <div className="glass-panel rounded-3xl p-6 shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"></div>
        </div>
        <p className="text-slate-300">Generating QR code...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-lg">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Patron check-in QR code</h2>
        <p className="text-sm text-slate-200 mb-6">
          Display this QR code at your bar for patrons to scan and verify their visit.
        </p>

        {qrCode && (
          <div className="inline-block p-4 bg-white rounded-xl mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCode} alt="Check-in QR Code" className="w-64 h-64" />
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <button onClick={handleDownload} className="btn-primary px-6 py-3 text-sm">
            Download QR code
          </button>
          <button onClick={handlePrint} className="btn-secondary px-6 py-3 text-sm">
            Print QR code
          </button>
          <button onClick={() => setShowInstructions(!showInstructions)} className="btn-secondary px-6 py-3 text-sm">
            Instructions
          </button>
        </div>

        {showInstructions && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
            <h3 className="font-semibold text-white mb-3">How to use your QR code:</h3>
            <ol className="space-y-2 text-sm text-slate-200">
              <li className="flex gap-2">
                <span className="font-bold text-cyan-300">1.</span>
                <span>Download or print the QR code</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-cyan-300">2.</span>
                <span>Display it prominently at your bar</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-cyan-300">3.</span>
                <span>Encourage patrons to scan it when they arrive</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-cyan-300">4.</span>
                <span>Track verified visits in your ROI dashboard</span>
              </li>
            </ol>
            <div className="mt-4 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <p className="text-xs text-slate-200">
                <strong>Pro tip:</strong> Offer a small incentive (like 5% off) for patrons who check in via QR code.
                This increases adoption and gives you valuable visit data for ROI tracking.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
