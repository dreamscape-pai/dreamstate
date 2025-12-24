'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

interface Faction {
  id: number;
  displayName: string;
  colorToken: string;
}

interface Event {
  id: number;
  factionId: number;
  points: number;
  description: string;
}

export default function EditScorePage() {
  const params = useParams();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [factions, setFactions] = useState<Faction[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedFactionId, setSelectedFactionId] = useState<number>(0);
  const [points, setPoints] = useState<string>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPassword = async () => {
      const adminAuth = localStorage.getItem('adminAuth');
      if (!adminAuth) {
        router.push('/admin/scores');
        return;
      }

      // Verify the password is actually valid
      try {
        const response = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminAuth }),
        });

        if (response.ok) {
          setAdminPassword(adminAuth);
          setIsAuthenticated(true);
        } else {
          // Invalid password - clear and redirect
          localStorage.removeItem('adminAuth');
          router.push('/admin/scores');
        }
      } catch (error) {
        localStorage.removeItem('adminAuth');
        router.push('/admin/scores');
      }
    };

    verifyPassword();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated && adminPassword) {
      fetchData();
    }
  }, [isAuthenticated, adminPassword, params.id]);

  const fetchData = async () => {
    try {
      const [factionsResponse, eventResponse] = await Promise.all([
        fetch('/api/factions/scores'),
        fetch(`/api/admin/factions/events/${params.id}`),
      ]);

      if (factionsResponse.ok) {
        const data = await factionsResponse.json();
        setFactions(data.factions);
      }

      if (eventResponse.ok) {
        const data = await eventResponse.json();
        setEvent(data.event);
        setSelectedFactionId(data.event.factionId);
        setPoints(data.event.points.toString());
        setDescription(data.event.description);
      } else {
        setError('Event not found');
      }
    } catch (err) {
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const pointsNum = parseInt(points);
      if (isNaN(pointsNum)) {
        setError('Points must be a valid number');
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/admin/factions/events/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminPassword}`,
        },
        body: JSON.stringify({
          factionId: selectedFactionId,
          points: pointsNum,
          description,
        }),
      });

      if (response.ok) {
        router.push('/scoreboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update event');
      }
    } catch (err) {
      setError('Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-dreamstate-midnight">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dreamstate-lavender"></div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !event) {
    return null;
  }

  const selectedFaction = factions.find(f => f.id === selectedFactionId);

  return (
    <main className="min-h-screen bg-dreamstate-midnight">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link
              href="/scoreboard"
              className="inline-flex items-center gap-2 text-dreamstate-lavender hover:text-dreamstate-periwinkle transition-colors"
            >
              <span>←</span>
              <span>Back to Scoreboard</span>
            </Link>
          </div>

          <h1 className="text-4xl md:text-5xl font-title font-bold text-center mb-8 text-dreamstate-ice">
            Edit Score Event
          </h1>

          <div className="bg-dreamstate-slate/20 rounded-lg p-8 border border-dreamstate-purple/30">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Faction Selection and Points - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-semibold mb-2 text-dreamstate-periwinkle">
                    Faction
                  </label>
                  <select
                    value={selectedFactionId}
                    onChange={(e) => setSelectedFactionId(parseInt(e.target.value))}
                    required
                    className="w-full px-4 py-3 bg-dreamstate-midnight border border-dreamstate-slate rounded-lg text-dreamstate-ice focus:outline-none focus:border-dreamstate-purple"
                  >
                    {factions.map((faction) => (
                      <option key={faction.id} value={faction.id}>
                        {faction.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-2 text-dreamstate-periwinkle">
                    Points
                  </label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    required
                    className="w-full px-4 py-3 bg-dreamstate-midnight border border-dreamstate-slate rounded-lg text-dreamstate-ice focus:outline-none focus:border-dreamstate-purple"
                    placeholder="e.g., 10 or -5"
                  />
                </div>
              </div>

              {/* Quick Point Buttons */}
              <div className="space-y-1.5">
                {/* Positive points */}
                <div className="flex flex-wrap gap-1.5">
                  {[1, 3, 5, 10, 20, 50].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPoints(value.toString())}
                      className="px-3 py-1.5 rounded-md text-sm font-semibold transition-colors bg-green-900/30 hover:bg-green-900/50 text-green-300 border border-green-700"
                    >
                      +{value}
                    </button>
                  ))}
                </div>
                {/* Negative points */}
                <div className="flex flex-wrap gap-1.5">
                  {[1, 3, 5, 10, 20, 50].map((value) => (
                    <button
                      key={-value}
                      type="button"
                      onClick={() => setPoints((-value).toString())}
                      className="px-3 py-1.5 rounded-md text-sm font-semibold transition-colors bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-700"
                    >
                      -{value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-lg font-semibold mb-2 text-dreamstate-periwinkle">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-dreamstate-midnight border border-dreamstate-slate rounded-lg text-dreamstate-ice focus:outline-none focus:border-dreamstate-purple"
                  placeholder="What happened? Why are points being awarded/deducted?"
                />
              </div>

              {/* Preview */}
              {selectedFaction && points && description && (
                <div className="bg-dreamstate-midnight/50 rounded-lg p-4 border border-dreamstate-purple/30">
                  <h3 className="text-sm font-semibold text-dreamstate-lavender mb-2">
                    Preview:
                  </h3>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-dreamstate-ice font-body">{description}</p>
                      <p className="text-sm text-dreamstate-periwinkle mt-1">
                        {selectedFaction.displayName}
                      </p>
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        parseInt(points) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {parseInt(points) >= 0 ? '+' : ''}{points}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-200">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/scoreboard')}
                  className="flex-1 px-6 py-4 bg-dreamstate-slate hover:bg-dreamstate-slate/70 text-dreamstate-ice text-lg font-semibold rounded-lg shadow-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-4 bg-dreamstate-purple hover:bg-dreamstate-slate disabled:bg-gray-600 text-dreamstate-ice text-lg font-semibold rounded-lg shadow-lg transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
