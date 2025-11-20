'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Image from 'next/image';

interface TicketInfo {
  ticketNumber: number;
  faction: {
    displayName: string;
    description: string;
    colorToken: string;
  };
}

export default function VerifyTicketPage() {
  const params = useParams();
  const token = params.token as string;
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTicketInfo() {
      try {
        const response = await fetch(`/api/tickets/info/${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load ticket');
        }

        setTicketInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ticket');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchTicketInfo();
    }
  }, [token]);

  const getFactionImage = (factionName: string) => {
    const name = factionName.toLowerCase();
    if (name.includes('déjà vu') || name.includes('deja vu')) return '/images/factions/deja vu.png';
    if (name.includes('lucid')) return '/images/factions/lucid.png';
    if (name.includes('hypnotic')) return '/images/factions/hypnotic.png';
    if (name.includes('drift')) return '/images/factions/drift.png';
    return '/images/factions/lucid.png';
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-dreamstate-purple mx-auto mb-4" />
            <p className="text-dreamstate-periwinkle">Loading your ticket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-md w-full bg-red-900/30 border border-red-500 rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-200 mb-2">Invalid Ticket</h2>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticketInfo) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-title font-bold text-dreamstate-ice mb-2">
              Your Dreamstate Ticket
            </h1>
            <p className="text-dreamstate-periwinkle">Ticket #{ticketInfo.ticketNumber}</p>
          </div>

          {/* Faction Card */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-dreamstate-purple/50 shadow-2xl mb-8 bg-dreamstate-slate/30 backdrop-blur-md">
            <div className="relative z-10 p-8 md:p-12 text-center">
              <div className="mb-6">
                <div className="w-32 h-32 mx-auto relative rounded-2xl overflow-hidden border-2 border-dreamstate-purple/30">
                  <Image
                    src={getFactionImage(ticketInfo.faction.displayName)}
                    alt={ticketInfo.faction.displayName}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-title font-bold mb-4 text-dreamstate-ice">
                You are {ticketInfo.faction.displayName}
              </h2>

              <p className="text-lg text-dreamstate-periwinkle leading-relaxed max-w-lg mx-auto font-body">
                {ticketInfo.faction.description}
              </p>
            </div>
          </div>

          {/* Entry Info */}
          <div className="bg-dreamstate-slate/30 p-6 rounded-lg border border-dreamstate-purple/30 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4 text-dreamstate-lavender font-subheading uppercase tracking-wide">
              📱 Entry Requirements
            </h3>
            <ul className="space-y-3 text-dreamstate-ice font-body">
              <li className="flex items-start">
                <span className="mr-2">✅</span>
                <span>Show this QR code at the door</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📧</span>
                <span>Bring your confirmation email</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🎭</span>
                <span>Prepare for faction-specific experiences</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
