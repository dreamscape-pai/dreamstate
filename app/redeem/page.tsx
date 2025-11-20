'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function RedeemPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tickets/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to redeem ticket');
      }

      // Store faction info in session storage
      sessionStorage.setItem('redeemResult', JSON.stringify(data));

      // Redirect to success page
      router.push('/redeem/success');
    } catch (err) {
      console.error('Error redeeming ticket:', err);
      setError(err instanceof Error ? err.message : 'Failed to redeem ticket');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-title font-bold mb-4 text-dreamstate-ice">
              Activate Your Ticket
            </h1>
            <p className="text-dreamstate-periwinkle font-body">
              Enter your details to discover your faction assignment
            </p>
          </div>

          <div className="bg-dreamstate-slate/30 p-8 rounded-lg border border-dreamstate-purple/30 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-2 text-dreamstate-lavender uppercase tracking-wide font-subheading">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-dreamstate-midnight border border-dreamstate-slate rounded-lg text-dreamstate-ice focus:outline-none focus:border-dreamstate-purple font-body"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2 text-dreamstate-lavender uppercase tracking-wide font-subheading">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-dreamstate-midnight border border-dreamstate-slate rounded-lg text-dreamstate-ice focus:outline-none focus:border-dreamstate-purple font-body"
                  placeholder="your@email.com"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-200 text-sm font-body">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-dreamstate-purple hover:bg-dreamstate-slate disabled:bg-gray-600 text-dreamstate-ice text-lg font-semibold rounded-lg shadow-lg font-body"
              >
                {loading ? 'Processing...' : 'Discover Your Faction'}
              </button>
            </form>

            <p className="text-xs text-center text-gray-500 mt-6 font-body">
              You will receive a confirmation email with your faction assignment and event details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
