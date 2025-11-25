'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

interface TicketData {
  ticketNumber: number;
  verificationToken: string;
  customerName: string | null;
  customerEmail: string;
  purchaseMethod: string;
  ticketTypeName: string;
  factionName: string;
  createdAt: string;
  isVerified: boolean;
  verifiedAt: string | null;
  stripePaymentIntentId: string | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      setIsAuthenticated(true);
      fetchTickets(adminAuth);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      // Verify password with backend
      const response = await fetch('/api/admin/verify-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'test', adminPassword: password }),
      });

      if (response.status === 401) {
        setAuthError('Invalid password');
        return;
      }

      localStorage.setItem('adminAuth', password);
      setIsAuthenticated(true);
      fetchTickets(password);
    } catch (err) {
      setAuthError('Failed to verify password');
    }
  };

  const fetchTickets = async (adminPassword: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/tickets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminPassword}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.tickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setTickets([]);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-dreamstate-slate/30 p-8 rounded-lg border border-dreamstate-purple/30 backdrop-blur-sm">
            <h1 className="text-3xl font-title font-bold text-dreamstate-ice mb-6 text-center">
              Admin Dashboard
            </h1>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-dreamstate-periwinkle mb-2 font-semibold">
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
                <p className="text-red-400 text-sm mb-4">{authError}</p>
              )}
              <button
                type="submit"
                className="w-full px-6 py-3 bg-dreamstate-purple hover:bg-dreamstate-purple/80 text-dreamstate-ice font-semibold rounded-lg transition-colors"
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
    <div className="min-h-screen">
      <Header />
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-title font-bold text-dreamstate-ice">
            Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-200 rounded-lg border border-red-500/50 transition-colors"
          >
            Logout
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dreamstate-purple mx-auto mb-4" />
            <p className="text-dreamstate-periwinkle">Loading tickets...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-4 text-dreamstate-periwinkle">
              Total Tickets: <span className="font-bold text-dreamstate-lavender">{tickets.length}</span>
            </div>

            <div className="bg-dreamstate-slate/30 rounded-lg border border-dreamstate-purple/30 backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dreamstate-midnight">
                    <tr>
                      <th className="px-4 py-3 text-left text-dreamstate-lavender font-semibold">Ticket #</th>
                      <th className="px-4 py-3 text-left text-dreamstate-lavender font-semibold">Name</th>
                      <th className="px-4 py-3 text-left text-dreamstate-lavender font-semibold">Email</th>
                      <th className="px-4 py-3 text-left text-dreamstate-lavender font-semibold">Method</th>
                      <th className="px-4 py-3 text-left text-dreamstate-lavender font-semibold">Type</th>
                      <th className="px-4 py-3 text-left text-dreamstate-lavender font-semibold">Faction</th>
                      <th className="px-4 py-3 text-left text-dreamstate-lavender font-semibold">Created</th>
                      <th className="px-4 py-3 text-left text-dreamstate-lavender font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-dreamstate-lavender font-semibold">Stripe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dreamstate-slate/30">
                    {tickets.map((ticket) => (
                      <tr
                        key={ticket.ticketNumber}
                        className="hover:bg-dreamstate-slate/20 transition-colors"
                      >
                        <td className="px-4 py-3 text-dreamstate-ice font-mono">
                          <Link
                            href={`/verify/${ticket.verificationToken}`}
                            className="hover:text-dreamstate-lavender cursor-pointer"
                          >
                            #{ticket.ticketNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-dreamstate-ice">
                          {ticket.customerName || '-'}
                        </td>
                        <td className="px-4 py-3 text-dreamstate-ice">
                          {ticket.customerEmail}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            ticket.purchaseMethod === 'online'
                              ? 'bg-blue-900/30 text-blue-200'
                              : 'bg-yellow-900/30 text-yellow-200'
                          }`}>
                            {ticket.purchaseMethod === 'online' ? 'Online' : 'In Person'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-dreamstate-periwinkle text-sm">
                          {ticket.ticketTypeName}
                        </td>
                        <td className="px-4 py-3 text-dreamstate-periwinkle">
                          {ticket.factionName}
                        </td>
                        <td className="px-4 py-3 text-dreamstate-ice text-sm">
                          {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          {ticket.isVerified ? (
                            <span className="px-2 py-1 bg-green-900/30 text-green-200 rounded text-xs font-semibold">
                              Used {ticket.verifiedAt && `(${new Date(ticket.verifiedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-700/30 text-gray-300 rounded text-xs font-semibold">
                              Unused
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {ticket.stripePaymentIntentId ? (
                            <a
                              href={`https://dashboard.stripe.com/payments/${ticket.stripePaymentIntentId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-xs underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-dreamstate-slate text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {tickets.length === 0 && (
              <div className="text-center py-12 text-dreamstate-periwinkle">
                No tickets found.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
