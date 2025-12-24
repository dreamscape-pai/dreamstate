'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import FactionEventList from '@/components/FactionEventList';

interface Faction {
  id: number;
  name: string;
  displayName: string;
  description: string;
  colorToken: string;
  iconUrl: string | null;
}

interface FactionScoreEvent {
  id: number;
  factionId: number;
  points: number;
  description: string;
  createdAt: string;
}

interface FactionScore {
  id: number;
  name: string;
  displayName: string;
  description: string;
  colorToken: string;
  iconUrl: string | null;
  totalPoints: number;
}

// Map faction names to image paths
const getFactionImage = (factionName: string): string => {
  const name = factionName.toLowerCase().replace('_', ' ');
  return `/images/factions/${name}.png`;
};

export default function FactionHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const [faction, setFaction] = useState<Faction | null>(null);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [events, setEvents] = useState<FactionScoreEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const factionId = params.id as string;
    fetchFactionData(factionId);
    // Poll for updates every 10 seconds
    const interval = setInterval(() => fetchFactionData(factionId), 10000);
    return () => clearInterval(interval);
  }, [params.id]);

  const fetchFactionData = async (factionId: string) => {
    try {
      const response = await fetch(`/api/factions/${factionId}/events`);
      if (response.ok) {
        const data = await response.json();
        setFaction(data.faction);
        setEvents(data.events);

        // Calculate total points
        const total = data.events.reduce((sum: number, event: FactionScoreEvent) => sum + event.points, 0);
        setTotalPoints(total);
      } else {
        router.push('/scoreboard');
      }
    } catch (error) {
      console.error('Error fetching faction data:', error);
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

  if (!faction) {
    return null;
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

        {/* Faction Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div
            className="relative rounded-xl border-4 overflow-hidden"
            style={{ borderColor: `var(--${faction.colorToken})` }}
          >
            {/* Background Image with Gradient */}
            <div className="absolute inset-0">
              <Image
                src={getFactionImage(faction.name)}
                alt={faction.displayName}
                fill
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg,
                    color-mix(in srgb, var(--${faction.colorToken}) 40%, transparent) 0%,
                    color-mix(in srgb, var(--${faction.colorToken}) 70%, #0a0a0f) 100%)`,
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 md:p-12 text-center">
              <h1 className="text-4xl md:text-6xl font-title font-bold text-dreamstate-ice drop-shadow-lg mb-4">
                {faction.displayName}
              </h1>
              <p className="text-dreamstate-ice/90 text-lg mb-6 drop-shadow">
                {faction.description}
              </p>
              <div
                className="text-6xl md:text-8xl font-title font-bold drop-shadow-lg"
                style={{ color: `var(--${faction.colorToken})` }}
              >
                {totalPoints} points
              </div>
            </div>
          </div>
        </div>

        {/* Event History */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-dreamstate-slate/20 rounded-lg p-6 md:p-8 border border-dreamstate-purple/30">
            <h2 className="text-2xl md:text-3xl font-title font-bold mb-6 text-dreamstate-lavender">
              Event History
            </h2>
            <FactionEventList events={events} />
          </div>
        </div>

        <p className="text-center mt-6 text-dreamstate-periwinkle text-sm">
          Updates automatically every 10 seconds
        </p>
      </div>
    </main>
  );
}
