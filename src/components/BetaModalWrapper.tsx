'use client';

import dynamic from 'next/dynamic';

const BetaModal = dynamic(() => import('./BetaModal'), { ssr: false });

export default function BetaModalWrapper() {
  return <BetaModal />;
}
