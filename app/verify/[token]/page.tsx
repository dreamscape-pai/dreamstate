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

interface VerificationResult {
  success?: boolean;
  alreadyVerified?: boolean;
  ticketNumber: number;
  customerEmail?: string;
  faction: {
    displayName: string;
    description?: string;
    colorToken: string;
  };
  verifiedAt?: string;
}

export default function VerifyTicketPage() {
  const params = useParams();
  const token = params.token as string;
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const adminAuth = sessionStorage.getItem('adminAuth');
    setIsAdmin(!!adminAuth);
  }, []);

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

  const handleVerifyTicket = async () => {
    setIsVerifying(true);
    try {
      const adminPassword = sessionStorage.getItem('adminAuth');
      const response = await fetch('/api/admin/verify-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, adminPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setVerificationResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify ticket');
    } finally {
      setIsVerifying(false);
    }
  };

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

          {/* Admin Verification */}
          {isAdmin && !verificationResult && (
            <div className="mt-6 bg-dreamstate-purple/20 p-6 rounded-lg border border-dreamstate-purple/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4 text-dreamstate-ice">
                Admin Verification
              </h3>
              <button
                onClick={handleVerifyTicket}
                disabled={isVerifying}
                className="w-full px-6 py-4 bg-dreamstate-purple hover:bg-dreamstate-purple/80 disabled:bg-dreamstate-slate text-dreamstate-ice font-semibold rounded-lg text-lg transition-colors"
              >
                {isVerifying ? 'Verifying...' : 'Verify Ticket'}
              </button>
            </div>
          )}

          {/* Verification Results */}
          {verificationResult && verificationResult.alreadyVerified && (
            <div className="mt-6 bg-yellow-900/30 border border-yellow-500 rounded-lg p-6">
              <div className="text-5xl text-center mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-yellow-200 text-center mb-4">
                Already Verified
              </h3>
              <div className="text-center space-y-2">
                <p className="text-yellow-300">
                  Ticket #{verificationResult.ticketNumber}
                </p>
                <p className="text-yellow-300">
                  Faction: {verificationResult.faction.displayName}
                </p>
                <p className="text-sm text-yellow-400">
                  Previously verified at: {verificationResult.verifiedAt ? new Date(verificationResult.verifiedAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          )}

          {verificationResult && verificationResult.success && (
            <div className="mt-6 bg-green-900/30 border border-green-500 rounded-lg p-6">
              <div className="text-5xl text-center mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-200 text-center mb-4">
                Ticket Verified!
              </h3>
              <div className="text-center space-y-3">
                <p className="text-xl text-green-100">
                  <strong>Ticket #{verificationResult.ticketNumber}</strong>
                </p>
                {verificationResult.customerEmail && (
                  <p className="text-green-200">
                    {verificationResult.customerEmail}
                  </p>
                )}
                <div className="mt-4 p-4 bg-dreamstate-slate/50 rounded-lg">
                  <p className="text-2xl font-bold mb-2" style={{ color: verificationResult.faction.colorToken }}>
                    {verificationResult.faction.displayName}
                  </p>
                  {verificationResult.faction.description && (
                    <p className="text-sm text-dreamstate-periwinkle">
                      {verificationResult.faction.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
