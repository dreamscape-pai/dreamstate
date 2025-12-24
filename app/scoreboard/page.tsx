'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import FactionEventList from '@/components/FactionEventList';

interface FactionScore {
  id: number;
  name: string;
  displayName: string;
  description: string;
  colorToken: string;
  iconUrl: string | null;
  totalPoints: number;
}

interface FactionScoreEvent {
  id: number;
  factionId: number;
  points: number;
  description: string;
  createdAt: string;
}

// Map faction names to image paths
const getFactionImage = (factionName: string): string => {
  const name = factionName.toLowerCase().replace('_', ' ');
  return `/images/factions/${name}.png`;
};

export default function ScoreboardPage() {
  const router = useRouter();
  const [factions, setFactions] = useState<FactionScore[]>([]);
  const [events, setEvents] = useState<FactionScoreEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      const adminAuth = localStorage.getItem('adminAuth');
      if (!adminAuth) {
        setIsAdmin(false);
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
          setIsAdmin(true);
        } else {
          // Invalid password - clear it and hide admin features
          localStorage.removeItem('adminAuth');
          setIsAdmin(false);
        }
      } catch (error) {
        localStorage.removeItem('adminAuth');
        setIsAdmin(false);
      }
    };

    verifyAdmin();
  }, []);

  const fetchData = async () => {
    try {
      const [scoresResponse, eventsResponse] = await Promise.all([
        fetch('/api/factions/scores'),
        fetch('/api/factions/events'),
      ]);

      if (scoresResponse.ok) {
        const scoresData = await scoresResponse.json();
        setFactions(scoresData.factions);
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.events);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    const adminPassword = localStorage.getItem('adminAuth');
    if (!adminPassword) return;

    try {
      const response = await fetch(`/api/admin/factions/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminPassword}`,
        },
      });

      if (response.ok) {
        // Refresh data
        fetchData();
      } else if (response.status === 401) {
        // Invalid password - clear localStorage and hide admin features
        localStorage.removeItem('adminAuth');
        setIsAdmin(false);
        alert('Invalid admin password. Please log in again.');
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <main className="min-h-screen bg-dreamstate-midnight">
      <Header />

      <div className="container mx-auto px-4 py-8 md:py-16">
        <h1 className="text-4xl md:text-6xl font-title font-bold text-center mb-8 md:mb-12 text-white">
          Faction Scoreboard
        </h1>

        {/* 2x2 Grid - stays 2x2 on mobile, always square, max 300px */}
        <div className="grid grid-cols-2 gap-2.5 max-w-[620px] mx-auto mb-12">
          {factions.map((faction) => (
            <div
              key={faction.id}
              className="relative max-w-[300px] max-h-[300px] mx-auto w-full"
            >
              <div className="relative rounded-xl border-4 overflow-hidden aspect-square flex flex-col justify-between"
                style={{
                  borderColor: `var(--${faction.colorToken})`,
                }}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={getFactionImage(faction.name)}
                    alt={faction.displayName}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Text Gradient Overlays - 45deg dark in top-left and bottom-right */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, rgba(10, 10, 15, 0.85) 0%, transparent 40%, transparent 60%, rgba(10, 10, 15, 0.9) 100%)`,
                  }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between h-full pt-4 md:pt-6 px-4 md:px-6">
                  {/* Faction Name at Top - Left Aligned */}
                  <h2 className="text-2xl md:text-4xl font-title font-bold text-dreamstate-ice drop-shadow-lg text-left whitespace-nowrap">
                    {faction.displayName}
                  </h2>

                  {/* Score at Bottom - Right Aligned */}
                  <div className="text-right pb-2 md:pb-3 leading-none">
                    <div className="text-5xl md:text-7xl font-title font-bold drop-shadow-lg leading-none"
                      style={{ color: `var(--${faction.colorToken})` }}
                    >
                      {faction.totalPoints < 0 && <span style={{ fontFamily: 'cursive' }}>−</span>}
                      {Math.abs(faction.totalPoints)}
                    </div>
                    <div className="text-sm md:text-base font-title text-dreamstate-ice/70 -mr-[5px] mb-[5px] leading-none">
                      points
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* All Events Timeline */}
        <div className="max-w-4xl mx-auto">
          {isAdmin && (
            <div className="text-center mb-6">
              <Link
                href="/admin/scores"
                className="inline-block px-6 py-3 bg-dreamstate-purple hover:bg-dreamstate-slate text-dreamstate-ice font-semibold rounded-lg shadow-lg transition-colors"
              >
                Add/Remove Points
              </Link>
              <p className="text-xs text-dreamstate-periwinkle/60 mt-1">(admin only)</p>
            </div>
          )}

          <div className="bg-dreamstate-slate/20 rounded-lg p-6 md:p-8 border border-dreamstate-purple/30">
            <h2 className="text-2xl md:text-3xl font-title font-bold mb-6 text-dreamstate-lavender">
              Are you dreaming?
            </h2>
            <div className="space-y-4">
              {events.map((event, index) => {
                const faction = factions.find(f => f.id === event.factionId);
                if (!faction) return null;

                // Calculate running total up to this event (events are sorted newest first, so reverse the calculation)
                const eventsUpToThis = events.slice(index); // All events from this one forward (older)
                const runningTotal = eventsUpToThis
                  .filter(e => e.factionId === event.factionId)
                  .reduce((sum, e) => sum + e.points, 0);

                // Format time without seconds - custom format
                const date = new Date(event.createdAt);
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const ampm = hours >= 12 ? 'pm' : 'am';
                const displayHours = hours % 12 || 12;
                const timeString = `${displayHours}.${minutes.toString().padStart(2, '0')}${ampm}`;

                return (
                  <div key={event.id} className="flex gap-2 items-center">
                    <div className="flex-1 bg-dreamstate-midnight/50 rounded-lg p-4 border border-dreamstate-purple/30 hover:border-dreamstate-purple/50 transition-colors">
                      {/* Top row with icon and points */}
                      <div className="flex gap-4 items-center">
                        {/* Faction Icon - Mini version of scoreboard card */}
                        <div className="shrink-0">
                          <div className="relative w-[80px] h-[80px] rounded-lg border-2 overflow-hidden"
                            style={{
                              borderColor: `var(--${faction.colorToken})`,
                            }}
                          >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                              <Image
                                src={getFactionImage(faction.name)}
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
                            <div className="relative z-10 h-full flex flex-col justify-between p-1">
                              {/* Faction Name - Top Left */}
                              <h3 className="text-xs font-title font-bold text-dreamstate-ice drop-shadow-lg text-left leading-tight mt-[1px]">
                                {faction.displayName}
                              </h3>

                              {/* Running Total - Bottom Right */}
                              <div className="text-right">
                                <div className="text-lg font-title font-bold drop-shadow-lg leading-none"
                                  style={{ color: `var(--${faction.colorToken})` }}
                                >
                                  {runningTotal < 0 && <span style={{ fontFamily: 'cursive' }}>−</span>}
                                  {Math.abs(runningTotal)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Points Display */}
                        <div className="text-right shrink-0 leading-none ml-auto sm:hidden">
                          <div
                            className={`text-4xl md:text-5xl font-title font-bold ${
                              event.points >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {event.points > 0 && <span style={{ fontFamily: 'cursive' }}>+</span>}
                            {event.points < 0 && <span style={{ fontFamily: 'cursive' }}>−</span>}
                            {Math.abs(event.points)}
                          </div>
                          <div className="text-sm font-title text-gray-400 mt-1">
                            points
                          </div>
                        </div>

                        {/* Event Details - Desktop */}
                        <div className="hidden sm:flex flex-1 justify-between items-center gap-4">
                          <div className="flex-1">
                            <p className="text-xl md:text-2xl font-bold text-dreamstate-ice font-body">
                              {event.description}
                            </p>
                            <p className="text-sm text-dreamstate-periwinkle/60 mt-1">
                              {timeString}
                            </p>
                          </div>
                          <div className="text-right shrink-0 leading-none">
                            <div
                              className={`text-4xl md:text-5xl font-title font-bold ${
                                event.points >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {event.points > 0 && <span style={{ fontFamily: 'cursive' }}>+</span>}
                              {event.points < 0 && <span style={{ fontFamily: 'cursive' }}>−</span>}
                              {Math.abs(event.points)}
                            </div>
                            <div className="text-sm font-title text-gray-400 mt-1">
                              points
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Event Details - Mobile (below) */}
                      <div className="sm:hidden mt-3">
                        <p className="text-xl font-bold text-dreamstate-ice font-body">
                          {event.description}
                        </p>
                        <p className="text-sm text-dreamstate-periwinkle/60 mt-1">
                          {timeString}
                        </p>
                      </div>
                    </div>

                    {/* Admin Controls - Outside border, stacked vertically */}
                    {isAdmin && (
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => router.push(`/admin/scores/edit/${event.id}`)}
                          className="p-2 rounded-lg bg-dreamstate-purple/30 hover:bg-dreamstate-purple/50 text-dreamstate-ice transition-colors"
                          title="Edit event"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-300 transition-colors"
                          title="Delete event"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {events.length === 0 && (
                <p className="text-center text-dreamstate-periwinkle py-8">
                  No points yet
                </p>
              )}

              {/* Starting Point - All factions at 0 */}
              <div className="pt-4 border-t border-dreamstate-purple/30 mt-4">
                <div className="flex gap-2 justify-center">
                  {factions.map((faction) => (
                    <div key={`start-${faction.id}`} className="md:mx-[10px]">
                      <div className="relative w-[80px] h-[80px] rounded-lg border-2 overflow-hidden opacity-40"
                        style={{
                          borderColor: `var(--${faction.colorToken})`,
                        }}
                      >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                          <Image
                            src={getFactionImage(faction.name)}
                            alt={faction.displayName}
                            fill
                            className="object-cover grayscale"
                          />
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 pointer-events-none"
                          style={{
                            background: `linear-gradient(135deg, rgba(10, 10, 15, 0.85) 0%, transparent 40%, transparent 60%, rgba(10, 10, 15, 0.9) 100%)`,
                          }}
                        />

                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col justify-between p-1">
                          {/* Faction Name - Top Left */}
                          <h3 className="text-xs font-title font-bold text-dreamstate-ice drop-shadow-lg text-left leading-tight mt-[1px]">
                            {faction.displayName}
                          </h3>

                          {/* Zero - Bottom Right */}
                          <div className="text-right">
                            <div className="text-lg font-title font-bold drop-shadow-lg leading-none text-gray-400">
                              0
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
