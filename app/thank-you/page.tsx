'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
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

  const getFactionClass = (colorToken: string) => {
    const tokenMap: Record<string, string> = {
      'faction-deja-vu': 'faction-bg-deja-vu',
      'faction-lucid': 'faction-bg-lucid',
      'faction-hypnotic': 'faction-bg-hypnotic',
      'faction-drift': 'faction-bg-drift',
    };
    return tokenMap[colorToken] || '';
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">✨</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to Dreamstate!
          </h1>
          <p className="text-xl text-gray-400">
            Your journey begins here
          </p>
        </div>

        {/* Faction Card */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-purple-500/50 shadow-2xl mb-8">
          <div className={`absolute inset-0 ${getFactionClass(orderInfo.faction.colorToken)} opacity-30`} />

          <div className="relative z-10 p-8 md:p-12 text-center">
            {orderInfo.faction.iconUrl && (
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-current">
                  <span className="text-sm text-gray-400">[Icon]</span>
                </div>
              </div>
            )}

            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              You are {orderInfo.faction.displayName}
            </h2>

            <p className="text-lg text-gray-200 leading-relaxed mb-6 max-w-lg mx-auto">
              {orderInfo.faction.description}
            </p>

            <div className="inline-block px-6 py-2 bg-black/30 rounded-full border border-current/30">
              <p className="text-sm text-gray-300">
                Participant #{orderInfo.orderSequenceNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Ticket Info */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold mb-4">What&apos;s Next?</h3>
          <ul className="space-y-3 text-gray-300">
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

        {/* Return Button */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-lg shadow-lg"
          >
            Return to Home Page
          </Link>
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
