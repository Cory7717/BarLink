'use client';

import { useEffect, useState } from 'react';

interface StaticOffering {
  id: string;
  name: string;
  icon: string;
  description: string;
  position: number;
}

export default function StaticOfferingsDisplay({ barId }: { barId: string }) {
  const [offerings, setOfferings] = useState<StaticOffering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const res = await fetch(`/api/bars/${barId}/static-offerings`);
        if (res.ok) {
          setOfferings(await res.json());
        }
      } catch (error) {
        console.error('Failed to fetch offerings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfferings();
  }, [barId]);

  if (loading || offerings.length === 0) return null;

  // Sort by position
  const sorted = [...offerings].sort((a, b) => a.position - b.position);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">What We Offer</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sorted.map(offering => (
          <div key={offering.id} className="bg-linear-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="text-4xl mb-3">{offering.icon}</div>
            <h4 className="font-semibold text-gray-900">{offering.name}</h4>
            {offering.description && (
              <p className="text-sm text-gray-600 mt-1">{offering.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
