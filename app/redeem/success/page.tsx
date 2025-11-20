'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import type { FactionInfo } from '@/lib/types';

interface RedeemResult {
  ticketNumber: number;
  faction: FactionInfo;
}

export default function RedeemSuccessPage() {
  const router = useRouter();
  const [result, setResult] = useState<RedeemResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('redeemResult');
    if (!stored) {
      router.push('/');
      return;
    }

    setResult(JSON.parse(stored));
    sessionStorage.removeItem('redeemResult');
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
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
    return '/images/factions/lucid.png';
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
              Ticket Activated!
            </h1>
            <p className="text-xl text-dreamstate-periwinkle">
              Your journey begins here
            </p>
          </div>

          {/* Faction Card */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-dreamstate-purple/50 shadow-2xl mb-8 bg-dreamstate-slate/30 backdrop-blur-md">
            <div className="relative z-10 p-8 md:p-12 text-center">
              <div className="mb-6">
                <div className="w-32 h-32 mx-auto relative rounded-2xl overflow-hidden border-2 border-dreamstate-purple/30">
                  <Image
                    src={getFactionImage(result.faction.displayName)}
                    alt={result.faction.displayName}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-title font-bold mb-4 text-dreamstate-ice">
                You are {result.faction.displayName}
              </h2>

              <p className="text-lg text-dreamstate-periwinkle leading-relaxed max-w-lg mx-auto font-body">
                {result.faction.description}
              </p>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-dreamstate-slate/30 p-6 rounded-lg border border-dreamstate-purple/30 mb-8 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4 text-dreamstate-lavender font-subheading uppercase tracking-wide">Important: Entry Requirements</h3>
            <ul className="space-y-3 text-dreamstate-ice font-body">
              <li className="flex items-start">
                <span className="mr-2">📧</span>
                <span>Show the confirmation email you just received when you arrive</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🎫</span>
                <span><strong>Your physical ticket is required to enter</strong> - bring it with you!</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🎭</span>
                <span>Prepare to experience faction-specific performances and activities</span>
              </li>
            </ul>
          </div>

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
