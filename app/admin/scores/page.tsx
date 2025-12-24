'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';

interface Faction {
  id: number;
  name: string;
  displayName: string;
  colorToken: string;
  totalPoints: number;
}

export default function AdminScoresPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [factions, setFactions] = useState<Faction[]>([]);
  const [selectedFactionId, setSelectedFactionId] = useState<number | null>(null);
  const [points, setPoints] = useState<string>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPassword = async () => {
      const adminAuth = localStorage.getItem('adminAuth');
      if (!adminAuth) {
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
          // Invalid password - clear it
          localStorage.removeItem('adminAuth');
        }
      } catch (error) {
        localStorage.removeItem('adminAuth');
      }
    };

    verifyPassword();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFactions();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      // Verify password with server before storing
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Valid password - store and authenticate
        localStorage.setItem('adminAuth', password);
        setAdminPassword(password);
        setIsAuthenticated(true);
      } else {
        // Invalid password
        setAuthError('Invalid password');
      }
    } catch (error) {
      setAuthError('Failed to verify password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setAdminPassword('');
    setFactions([]);
  };

  const fetchFactions = async () => {
    try {
      const response = await fetch('/api/factions/scores');
      if (response.ok) {
        const data = await response.json();
        setFactions(data.factions);
        if (data.factions.length > 0 && !selectedFactionId) {
          setSelectedFactionId(data.factions[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching factions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const pointsNum = parseInt(points);
      if (isNaN(pointsNum)) {
        setError('Points must be a valid number');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/factions/score', {
        method: 'POST',
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
        setSuccess(true);
        setPoints('');
        setDescription('');
        // Refresh faction scores
        fetchFactions();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await response.json();
        if (response.status === 401) {
          setError('Invalid password. Please logout and try again.');
        } else {
          setError(data.error || 'Failed to add score');
        }
      }
    } catch (err) {
      setError('Failed to add score');
    } finally {
      setLoading(false);
    }
  };

  const selectedFaction = factions.find(f => f.id === selectedFactionId);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-dreamstate-slate/30 p-8 rounded-lg border border-dreamstate-purple/30 backdrop-blur-sm">
            <h1 className="text-3xl font-title font-bold text-dreamstate-ice mb-6 text-center">
              Manage Faction Scores
            </h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dreamstate-periwinkle mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-dreamstate-midnight border border-dreamstate-slate rounded-lg text-dreamstate-ice focus:outline-none focus:border-dreamstate-purple"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              {authError && (
                <p className="text-red-400 text-sm">{authError}</p>
              )}
              <button
                type="submit"
                className="w-full px-4 py-3 bg-dreamstate-purple hover:bg-dreamstate-slate text-dreamstate-ice font-semibold rounded-lg transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-dreamstate-midnight">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-title font-bold text-dreamstate-ice">
              Manage Faction Scores
            </h1>
          </div>

          <div className="mb-8 text-center">
            <a
              href="/scoreboard"
              className="text-dreamstate-lavender hover:text-dreamstate-periwinkle underline"
            >
              View Scoreboard
            </a>
          </div>

          {/* Current Scores Display */}
          <div className="bg-dreamstate-slate/30 rounded-lg p-6 mb-8 border border-dreamstate-purple/30">
            <h2 className="text-2xl font-title font-bold mb-4 text-dreamstate-ice">
              Current Scores
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {factions.map((faction) => (
                <div
                  key={faction.id}
                  className="p-4 rounded-lg border-2"
                  style={{
                    borderColor: `var(--${faction.colorToken})`,
                    backgroundColor: `color-mix(in srgb, var(--${faction.colorToken}) 10%, transparent)`,
                  }}
                >
                  <div className="text-lg font-semibold text-dreamstate-ice">
                    {faction.displayName}
                  </div>
                  <div
                    className="text-3xl font-title font-bold"
                    style={{ color: `var(--${faction.colorToken})` }}
                  >
                    {faction.totalPoints < 0 && <span style={{ fontFamily: 'cursive' }}>−</span>}
                    {Math.abs(faction.totalPoints)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Score Form */}
          <div className="bg-dreamstate-slate/20 rounded-lg p-8 border border-dreamstate-purple/30">
            <h2 className="text-2xl font-title font-bold mb-6 text-dreamstate-ice">
              Add Score Event
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Faction Selection and Points - Side by Side on Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Faction Selection */}
                <div>
                  <label className="block text-lg font-semibold mb-2 text-dreamstate-periwinkle">
                    Faction
                  </label>
                  <div className="grid grid-cols-2 gap-6 max-w-[224px]">
                    {factions.map((faction) => (
                      <button
                        key={faction.id}
                        type="button"
                        onClick={() => setSelectedFactionId(faction.id)}
                        className="relative"
                      >
                        <div className={`relative w-[100px] h-[100px] rounded-lg border-2 overflow-hidden transition-all ${
                          selectedFactionId === faction.id ? 'ring-[3px] ring-green-400 ring-offset-2 ring-offset-dreamstate-midnight opacity-100' : 'opacity-40'
                        }`}
                          style={{
                            borderColor: `var(--${faction.colorToken})`,
                          }}
                        >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                          <Image
                            src={`/images/factions/${faction.name.toLowerCase().replace('_', ' ')}.png`}
                            alt={faction.displayName}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 pointer-events-none"
                          style={{
                            background: `linear-gradient(135deg, rgba(10, 10, 15, 0.85) 0%, transparent 40%, transparent 60%, rgba(10, 10, 15, 0.9) 100%)`,
                          }}
                        />

                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col justify-between p-2">
                          {/* Faction Name - Top Left */}
                          <h3 className="text-sm font-title font-bold text-dreamstate-ice drop-shadow-lg text-left leading-tight">
                            {faction.displayName}
                          </h3>
                        </div>
                      </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Points */}
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

                  {/* Quick Point Buttons */}
                  <div className="mt-2 mb-[10px]">
                    {/* Positive points */}
                    <div className="flex justify-between mt-[10px] mb-[10px]">
                      {[1, 3, 5, 10, 20, 50].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setPoints(value.toString())}
                          className="px-2 py-1 rounded font-semibold transition-colors bg-green-900/30 hover:bg-green-900/50 text-green-300 border border-green-700"
                          style={{ fontSize: '15px' }}
                        >
                          +{value}
                        </button>
                      ))}
                    </div>
                    {/* Negative points */}
                    <div className="flex justify-between">
                      {[1, 3, 5, 10, 20, 50].map((value) => (
                        <button
                          key={-value}
                          type="button"
                          onClick={() => setPoints((-value).toString())}
                          className="px-2 py-1 rounded font-semibold transition-colors bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-700"
                          style={{ fontSize: '15px' }}
                        >
                          -{value}
                        </button>
                      ))}
                    </div>
                  </div>
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

              {/* Success Message */}
              {success && (
                <div className="p-4 bg-green-900/30 border border-green-500 rounded-lg text-green-200">
                  Score event added successfully!
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-dreamstate-purple hover:bg-dreamstate-slate disabled:bg-gray-600 text-dreamstate-ice text-lg font-semibold rounded-lg shadow-lg transition-colors"
              >
                {loading ? 'Adding...' : 'Add Score Event'}
              </button>
            </form>
          </div>

          {/* Logout Link */}
          <div className="text-center mt-8">
            <button
              onClick={handleLogout}
              className="text-dreamstate-periwinkle hover:text-red-400 text-sm underline"
            >
              Logout as admin
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
