'use client';

import { useEffect, useState } from 'react';

interface FoodOffering {
  id: string;
  name: string;
  description: string;
  specialDays: number[];
  isSpecial: boolean;
  active: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function FoodOfferingsDisplay({ barId }: { barId: string }) {
  const [offerings, setOfferings] = useState<FoodOffering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const res = await fetch(`/api/bars/${barId}/food-offerings`);
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

  const activeOfferings = offerings.filter(o => o.active && !o.isSpecial);
  const specialOfferings = offerings.filter(o => o.active && o.isSpecial);

  return (
    <div className="mt-6 space-y-6">
      {activeOfferings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">🍗 Food & Bites</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeOfferings.map(offering => (
              <div key={offering.id} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 className="font-medium text-gray-900">{offering.name}</h4>
                {offering.description && (
                  <p className="text-sm text-gray-600 mt-1">{offering.description}</p>
                )}
                {offering.specialDays.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    📅 {offering.specialDays.map(d => DAYS[d]).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {specialOfferings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">⭐ Special Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {specialOfferings.map(offering => (
              <div key={offering.id} className="bg-amber-50 p-3 rounded-lg border border-amber-300">
                <h4 className="font-medium text-gray-900">{offering.name}</h4>
                {offering.description && (
                  <p className="text-sm text-gray-600 mt-1">{offering.description}</p>
                )}
                {offering.specialDays.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    📅 {offering.specialDays.map(d => DAYS[d]).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
