'use client';

import { useEffect, useState } from 'react';

interface DrinkSpecial {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  active: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isSpecialActive(special: DrinkSpecial): boolean {
  if (!special.active) return false;

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // If no specific days, it's active daily
  const isRightDay = special.daysOfWeek.length === 0 || special.daysOfWeek.includes(currentDay);
  const isRightTime = currentTime >= special.startTime && currentTime <= special.endTime;

  return isRightDay && isRightTime;
}

export default function DrinkSpecialsDisplay({ barId }: { barId: string }) {
  const [specials, setSpecials] = useState<DrinkSpecial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecials = async () => {
      try {
        const res = await fetch(`/api/bars/${barId}/drink-specials`);
        if (res.ok) {
          setSpecials(await res.json());
        }
      } catch (error) {
        console.error('Failed to fetch specials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecials();
  }, [barId]);

  if (loading || specials.length === 0) return null;

  const activeSpecials = specials.filter(s => isSpecialActive(s));
  const upcomingSpecials = specials.filter(s => !isSpecialActive(s) && s.active);

  return (
    <div className="mt-6 space-y-6">
      {activeSpecials.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-700">🎉 Active Specials Right Now</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSpecials.map(special => (
              <div key={special.id} className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900">{special.name}</h4>
                {special.description && (
                  <p className="text-sm text-gray-600 mt-1">{special.description}</p>
                )}
                <p className="text-xs text-green-700 mt-2 font-medium">
                  ⏰ {special.startTime} - {special.endTime}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcomingSpecials.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingSpecials.map(special => (
              <div key={special.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900">{special.name}</h4>
                {special.description && (
                  <p className="text-sm text-gray-600 mt-1">{special.description}</p>
                )}
                <p className="text-xs text-gray-600 mt-2">
                  {special.daysOfWeek.length === 0 ? (
                    <>⏰ Daily {special.startTime} - {special.endTime}</>
                  ) : (
                    <>📅 {special.daysOfWeek.map(d => DAYS[d]).join(', ')} {special.startTime} - {special.endTime}</>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
