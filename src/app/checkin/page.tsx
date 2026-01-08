'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

function CheckInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing check-in...');
  const [barName, setBarName] = useState('');

  useEffect(() => {
    const processCheckIn = async () => {
      try {
        const qrData = searchParams.get('data');
        
        if (!qrData) {
          setStatus('error');
          setMessage('Invalid check-in link');
          return;
        }

        // Parse QR data
        const data = JSON.parse(decodeURIComponent(qrData));
        setBarName(data.barName || 'this bar');

        // Submit check-in
        const response = await fetch('/api/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            barId: data.barId,
            qrData,
            source: 'qr_code',
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setStatus('success');
          setMessage(`Successfully checked in at ${result.visit.barName}!`);
          setBarName(result.visit.barName);
          
          // Redirect to explore page after 3 seconds
          setTimeout(() => {
            router.push('/explore');
          }, 3000);
        } else {
          const error = await response.json();
          setStatus('error');
          setMessage(error.error || 'Check-in failed');
        }
      } catch (error) {
        console.error('Check-in error:', error);
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    };

    processCheckIn();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 text-white">
      <Navigation />
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-24">
        <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-8 shadow-lg text-center">
          {status === 'processing' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{message}</h1>
              <p className="text-slate-300">Please wait...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border-4 border-emerald-500">
                  <svg className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-200 to-emerald-400 bg-clip-text text-transparent mb-2">
                {message}
              </h1>
              <p className="text-slate-300 mb-6">
                Thanks for checking in! Your visit helps {barName} understand their impact.
              </p>
              <div className="inline-flex items-center gap-2 text-sm text-slate-400">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Redirecting...
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 border-4 border-red-500">
                  <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-red-200 mb-2">Check-in Failed</h1>
              <p className="text-slate-300 mb-6">{message}</p>
              <button
                onClick={() => router.push('/explore')}
                className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-slate-950 hover:from-emerald-400 hover:to-emerald-500 transition-all"
              >
                Explore Bars
              </button>
            </>
          )}
        </div>

        {status === 'success' && (
          <div className="mt-8 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-md p-6">
            <h2 className="text-lg font-semibold text-emerald-200 mb-3">💡 Did you know?</h2>
            <p className="text-emerald-100/90 text-sm">
              Your check-in helps bar owners see the real value of BarPulse! They can track how many people 
              discover their bar online and actually visit in person. This data helps them make better decisions 
              about events, promotions, and offerings.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <CheckInContent />
    </Suspense>
  );
}
