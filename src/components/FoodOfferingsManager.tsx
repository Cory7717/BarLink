'use client';

import { useState, useEffect } from 'react';

interface FoodOffering {
  id: string;
  barId: string;
  name: string;
  description: string;
  specialDays: number[];
  isSpecial: boolean;
  active: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function FoodOfferingsManager({ barId }: { barId: string }) {
  const [offerings, setOfferings] = useState<FoodOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOffering, setNewOffering] = useState<{
    name: string;
    description: string;
    specialDays: number[];
    isSpecial: boolean;
    active: boolean;
  }>({
    name: '',
    description: '',
    specialDays: [],
    isSpecial: false,
    active: true
  });

  useEffect(() => {
    fetchOfferings();
  }, [barId]);

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

  const handleAdd = async () => {
    if (!newOffering.name.trim()) {
      alert('Please enter a food name');
      return;
    }

    try {
      const res = await fetch(`/api/bars/${barId}/food-offerings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOffering)
      });

      if (res.ok) {
        const created = await res.json();
        setOfferings([...offerings, created]);
        setNewOffering({
          name: '',
          description: '',
          specialDays: [],
          isSpecial: false,
          active: true
        });
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create offering');
      }
    } catch (error) {
      console.error('Error creating offering:', error);
      alert('Failed to create offering');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this food offering?')) return;

    try {
      const res = await fetch(`/api/bars/${barId}/food-offerings`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        setOfferings(offerings.filter(o => o.id !== id));
      }
    } catch (error) {
      console.error('Error deleting offering:', error);
      alert('Failed to delete offering');
    }
  };

  const toggleDay = (day: number) => {
    const days = newOffering.specialDays;
    if (days.includes(day)) {
      setNewOffering({
        ...newOffering,
        specialDays: days.filter(d => d !== day)
      });
    } else {
      setNewOffering({
        ...newOffering,
        specialDays: [...days, day].sort((a, b) => a - b)
      });
    }
  };

  const formatDays = (days: number[]) => {
    if (days.length === 0) return 'Always Available';
    if (days.length === 7) return 'Always Available';
    return days.map(d => DAYS[d]).join(', ');
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-gray-50">
      <div>
        <h3 className="text-lg font-semibold mb-4">Food Offerings</h3>
        <p className="text-sm text-gray-600 mb-4">Add food items and daily specials</p>

        {/* Display current offerings */}
        <div className="space-y-2 mb-6">
          {offerings.length === 0 ? (
            <p className="text-gray-500 text-sm">No food offerings yet</p>
          ) : (
            offerings.map(offering => (
              <div key={offering.id} className="bg-white p-3 rounded border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">
                      {offering.name}
                      {offering.isSpecial && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Special</span>}
                    </p>
                    {offering.description && <p className="text-sm text-gray-600">{offering.description}</p>}
                  </div>
                  <button
                    onClick={() => handleDelete(offering.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  <p>📅 {formatDays(offering.specialDays)}</p>
                  <p>Status: {offering.active ? '✓ Active' : '✗ Inactive'}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add new offering */}
        <div className="bg-white p-4 rounded border space-y-3">
          <h4 className="font-medium">Add New Food Offering</h4>
          
          <div>
            <label className="block text-sm font-medium mb-1">Food Name *</label>
            <input
              type="text"
              value={newOffering.name}
              onChange={(e) => setNewOffering({ ...newOffering, name: e.target.value })}
              placeholder="e.g., Wings, Nachos, Sliders"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={newOffering.description}
              onChange={(e) => setNewOffering({ ...newOffering, description: e.target.value })}
              placeholder="e.g., Available 4pm - 11pm"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isSpecial"
              checked={newOffering.isSpecial}
              onChange={(e) => setNewOffering({ ...newOffering, isSpecial: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="isSpecial" className="ml-2 text-sm font-medium">
              This is a special/limited item
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Available On (leave blank for always)</label>
            <div className="grid grid-cols-2 gap-2">
              {DAYS.map((day, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`py-2 px-3 rounded border text-sm font-medium ${
                    newOffering.specialDays.includes(i)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            Add Food Offering
          </button>
        </div>
      </div>
    </div>
  );
}
