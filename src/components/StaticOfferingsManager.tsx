'use client';

import { useState, useEffect } from 'react';

interface StaticOffering {
  id: string;
  barId: string;
  name: string;
  icon: string;
  description: string;
  position: number;
}

const ICONS = ['🎮', '🎯', '🎲', '🎰', '🎭', '🎪', '🏆', '🎊', '🎈', '🎉'];

export default function StaticOfferingsManager({ barId }: { barId: string }) {
  const [offerings, setOfferings] = useState<StaticOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOffering, setNewOffering] = useState<{
    name: string;
    icon: string;
    description: string;
    position: number;
  }>({
    name: '',
    icon: '🎮',
    description: '',
    position: 0
  });

  useEffect(() => {
    fetchOfferings();
  }, [barId]);

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

  const handleAdd = async () => {
    if (!newOffering.name.trim()) {
      alert('Please enter an offering name');
      return;
    }

    // Check if position is taken
    if (offerings.some(o => o.position === newOffering.position)) {
      alert(`Position ${newOffering.position} is already taken`);
      return;
    }

    try {
      const res = await fetch(`/api/bars/${barId}/static-offerings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOffering)
      });

      if (res.ok) {
        const created = await res.json();
        setOfferings([...offerings, created]);
        setNewOffering({ name: '', icon: '🎮', description: '', position: 0 });
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
    if (!confirm('Delete this offering?')) return;

    try {
      const res = await fetch(`/api/bars/${barId}/static-offerings`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        setOfferings(offerings.filter(o => o.id !== id));
      } else {
        alert('Failed to delete offering');
      }
    } catch (error) {
      console.error('Error deleting offering:', error);
      alert('Failed to delete offering');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const availablePositions = [0, 1, 2].filter(p => !offerings.some(o => o.position === p));

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-gray-50">
      <div>
        <h3 className="text-lg font-semibold mb-4">Static Offerings</h3>
        <p className="text-sm text-gray-600 mb-4">Add up to 3 permanent offerings (like games, activities)</p>

        {/* Display current offerings */}
        <div className="space-y-2 mb-6">
          {offerings.length === 0 ? (
            <p className="text-gray-500 text-sm">No static offerings yet</p>
          ) : (
            offerings.map(offering => (
              <div key={offering.id} className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{offering.icon}</span>
                  <div>
                    <p className="font-medium">{offering.name}</p>
                    {offering.description && <p className="text-sm text-gray-600">{offering.description}</p>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(offering.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add new offering */}
        {availablePositions.length > 0 && (
          <div className="bg-white p-4 rounded border space-y-3">
            <h4 className="font-medium">Add New Offering</h4>
            
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={newOffering.name}
                onChange={(e) => setNewOffering({ ...newOffering, name: e.target.value })}
                placeholder="e.g., Darts, Sweepstakes Games, Pool"
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Icon</label>
              <div className="grid grid-cols-5 gap-2">
                {ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setNewOffering({ ...newOffering, icon })}
                    className={`text-2xl p-2 rounded border-2 ${
                      newOffering.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={newOffering.description}
                onChange={(e) => setNewOffering({ ...newOffering, description: e.target.value })}
                placeholder="Optional description"
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Position</label>
              <select
                value={newOffering.position}
                onChange={(e) => setNewOffering({ ...newOffering, position: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded"
              >
                {availablePositions.map(p => (
                  <option key={p} value={p}>
                    Position {p + 1}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAdd}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            >
              Add Offering
            </button>
          </div>
        )}

        {availablePositions.length === 0 && offerings.length > 0 && (
          <p className="text-sm text-gray-500 bg-yellow-50 p-3 rounded">
            Maximum 3 offerings reached. Delete one to add another.
          </p>
        )}
      </div>
    </div>
  );
}
