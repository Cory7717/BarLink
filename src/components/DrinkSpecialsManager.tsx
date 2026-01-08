'use client';

import { useState, useEffect } from 'react';

interface DrinkSpecial {
  id: string;
  barId: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  active: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DrinkSpecialsManager({ barId }: { barId: string }) {
  const [specials, setSpecials] = useState<DrinkSpecial[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSpecial, setNewSpecial] = useState<{
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    active: boolean;
  }>({
    name: '',
    description: '',
    startTime: '17:00',
    endTime: '21:00',
    daysOfWeek: [],
    active: true
  });

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

  const handleAdd = async () => {
    if (!newSpecial.name.trim()) {
      alert('Please enter a drink name');
      return;
    }

    try {
      const res = await fetch(`/api/bars/${barId}/drink-specials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSpecial)
      });

      if (res.ok) {
        const created = await res.json();
        setSpecials([...specials, created]);
        setNewSpecial({
          name: '',
          description: '',
          startTime: '17:00',
          endTime: '21:00',
          daysOfWeek: [],
          active: true
        });
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create special');
      }
    } catch (error) {
      console.error('Error creating special:', error);
      alert('Failed to create special');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this drink special?')) return;

    try {
      const res = await fetch(`/api/bars/${barId}/drink-specials`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        setSpecials(specials.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting special:', error);
      alert('Failed to delete special');
    }
  };

  const toggleDay = (day: number) => {
    const days = newSpecial.daysOfWeek;
    if (days.includes(day)) {
      setNewSpecial({
        ...newSpecial,
        daysOfWeek: days.filter(d => d !== day)
      });
    } else {
      setNewSpecial({
        ...newSpecial,
        daysOfWeek: [...days, day].sort((a, b) => a - b)
      });
    }
  };

  const formatDays = (days: number[]) => {
    if (days.length === 0) return 'Daily';
    if (days.length === 7) return 'Daily';
    return days.map(d => DAYS[d]).join(', ');
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-gray-50">
      <div>
        <h3 className="text-lg font-semibold mb-4">Drink Specials</h3>
        <p className="text-sm text-gray-600 mb-4">Add timed drink promotions</p>

        {/* Display current specials */}
        <div className="space-y-2 mb-6">
          {specials.length === 0 ? (
            <p className="text-gray-500 text-sm">No drink specials yet</p>
          ) : (
            specials.map(special => (
              <div key={special.id} className="bg-white p-3 rounded border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{special.name}</p>
                    {special.description && <p className="text-sm text-gray-600">{special.description}</p>}
                  </div>
                  <button
                    onClick={() => handleDelete(special.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>⏰ {special.startTime} - {special.endTime}</p>
                  <p>📅 {formatDays(special.daysOfWeek)}</p>
                  <p>Status: {special.active ? '✓ Active' : '✗ Inactive'}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add new special */}
        <div className="bg-white p-4 rounded border space-y-3">
          <h4 className="font-medium">Add New Drink Special</h4>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="drink-name">Drink Name *</label>
            <input
              id="drink-name"
              type="text"
              value={newSpecial.name}
              onChange={(e) => setNewSpecial({ ...newSpecial, name: e.target.value })}
              placeholder="e.g., Happy Hour, Ladies Night, Tequila Tuesday"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="drink-description">Description</label>
            <input
              id="drink-description"
              type="text"
              value={newSpecial.description}
              onChange={(e) => setNewSpecial({ ...newSpecial, description: e.target.value })}
              placeholder="e.g., $2 off all drinks"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="drink-start">Start Time</label>
              <input
                id="drink-start"
                type="time"
                value={newSpecial.startTime}
                onChange={(e) => setNewSpecial({ ...newSpecial, startTime: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="drink-end">End Time</label>
              <input
                id="drink-end"
                type="time"
                value={newSpecial.endTime}
                onChange={(e) => setNewSpecial({ ...newSpecial, endTime: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Active Days (leave blank for daily)</label>
            <div className="grid grid-cols-4 gap-2">
              {DAYS.map((day, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`py-2 rounded border text-sm font-medium ${
                    newSpecial.daysOfWeek.includes(i)
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
            Add Drink Special
          </button>
        </div>
      </div>
    </div>
  );
}
