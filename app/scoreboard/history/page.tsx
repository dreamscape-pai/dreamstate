'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import FactionEventList from '@/components/FactionEventList';

interface FactionScoreEvent {
  id: number;
  factionId: number;
  points: number;
  description: string;
  createdAt: string;
}

interface Faction {
  id: number;
  name: string;
  displayName: string;
  colorToken: string;
  totalPoints: number;
}

export default function AllFactionsHistoryPage() {
  const [events, setEvents] = useState<FactionScoreEvent[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch both events and faction data in parallel
      const [eventsResponse, factionsResponse] = await Promise.all([
        fetch('/api/factions/events'),
        fetch('/api/factions/scores'),
      ]);

      if (eventsResponse.ok && factionsResponse.ok) {
        const eventsData = await eventsResponse.json();
        const factionsData = await factionsResponse.json();
        setEvents(eventsData.events);
        setFactions(factionsData.factions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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

  return (
    <main className="min-h-screen bg-dreamstate-midnight">
      <Header />

      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Back Link */}
        <div className="max-w-4xl mx-auto mb-6">
          <Link
            href="/scoreboard"
            className="inline-flex items-center gap-2 text-dreamstate-lavender hover:text-dreamstate-periwinkle transition-colors"
          >
            <span>←</span>
            <span>Back to Scoreboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl md:text-6xl font-title font-bold text-center mb-6 text-dreamstate-ice">
            All Faction History
          </h1>

          {/* Current Scores Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            {factions.map((faction) => (
              <Link
                key={faction.id}
                href={`/scoreboard/${faction.id}`}
                className="p-4 rounded-lg border-2 text-center hover:scale-105 transition-transform"
                style={{
                  borderColor: `var(--${faction.colorToken})`,
                  backgroundColor: `color-mix(in srgb, var(--${faction.colorToken}) 10%, transparent)`,
                }}
              >
                <div className="text-sm md:text-base font-semibold text-dreamstate-ice mb-1">
                  {faction.displayName}
                </div>
                <div
                  className="text-2xl md:text-3xl font-title font-bold"
                  style={{ color: `var(--${faction.colorToken})` }}
                >
                  {faction.totalPoints}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Events */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-dreamstate-slate/20 rounded-lg p-6 md:p-8 border border-dreamstate-purple/30">
            <h2 className="text-2xl md:text-3xl font-title font-bold mb-6 text-dreamstate-lavender">
              Complete Event Timeline
            </h2>
            <FactionEventList events={events} factions={factions} showFactionName={true} />
          </div>
        </div>

        <p className="text-center mt-6 text-dreamstate-periwinkle text-sm">
          Updates automatically every 10 seconds
        </p>
      </div>
    </main>
  );
}
