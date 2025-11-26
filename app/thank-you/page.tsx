'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import FactionGrid from '@/components/FactionGrid';
import type { OrderInfoResponse } from '@/lib/types';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [orderInfo, setOrderInfo] = useState<OrderInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found. Please check your confirmation email or contact support.');
      setLoading(false);
      return;
    }

    fetchOrderInfo(sessionId);
  }, [sessionId]);

  const fetchOrderInfo = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/order/by-session?session_id=${sessionId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error);
      }

      const data = await response.json();
      setOrderInfo(data);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err instanceof Error ? err.message : 'Failed to load order information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading your faction assignment...</p>
        </div>
      </div>
    );
  }

  if (error || !orderInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-3xl font-bold mb-4">Unable to Load Order</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const getFactionImage = (factionName: string) => {
    const name = factionName.toLowerCase();
    if (name.includes('déjà vu') || name.includes('deja vu')) return '/images/factions/deja vu.png';
    if (name.includes('lucid')) return '/images/factions/lucid.png';
    if (name.includes('hypnotic')) return '/images/factions/hypnotic.png';
    if (name.includes('drift')) return '/images/factions/drift.png';
    return '/images/factions/lucid.png'; // default
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full">
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">✨</div>
            <h1 className="text-4xl md:text-5xl font-title font-bold mb-4 text-dreamstate-ice">
              Welcome
            </h1>
            <p className="text-xl text-dreamstate-periwinkle">
              Your journey begins here
            </p>
          </div>

          {/* Faction Cards */}
          <div className="space-y-6 mb-8">
            {orderInfo.tickets.map((ticket, index) => (
              <div key={ticket.ticketNumber} className="relative overflow-hidden rounded-2xl border-2 border-dreamstate-purple/50 shadow-2xl bg-dreamstate-slate/30 backdrop-blur-md">
                <div className="relative z-10 p-8 md:p-12 text-center">
                  <div className="mb-6">
                    <div className="w-32 h-32 mx-auto relative rounded-2xl overflow-hidden border-2 border-dreamstate-purple/30">
                      <Image
                        src={getFactionImage(ticket.faction.displayName)}
                        alt={ticket.faction.displayName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-title font-bold mb-2 text-dreamstate-ice">
                    {orderInfo.tickets.length > 1 && `Ticket ${index + 1}: `}
                    {ticket.faction.displayName}
                  </h2>

                  <p className="text-lg text-dreamstate-periwinkle leading-relaxed max-w-lg mx-auto font-body">
                    {ticket.faction.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Ticket Info */}
          <div className="bg-dreamstate-slate/30 p-6 rounded-lg border border-dreamstate-purple/30 mb-8 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4 text-dreamstate-lavender font-subheading uppercase tracking-wide">What&apos;s Next?</h3>
            <ul className="space-y-3 text-dreamstate-ice font-body">
              <li className="flex items-start">
                <span className="mr-2">📧</span>
                <span>Check your email for your ticket confirmation and event details</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🎭</span>
                <span>Prepare to experience faction-specific performances and activities</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🎫</span>
                <span>
                  You purchased {orderInfo.quantity} {orderInfo.quantity === 1 ? 'ticket' : 'tickets'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* All Factions Section */}
      <div className="pb-16">
        <FactionGrid />
      </div>

      <div className="flex items-center justify-center px-4 pb-16">
        <div className="max-w-2xl w-full">
          {/* Return Button */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-dreamstate-purple hover:bg-dreamstate-slate rounded-lg font-semibold text-lg shadow-lg text-dreamstate-ice font-body"
            >
              Return to Home Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
