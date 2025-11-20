'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';

export default function AdminVerifyPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Check if already authenticated in localStorage
    const saved = localStorage.getItem('adminAuth');
    if (saved) {
      setIsAuthenticated(true);
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

      // Password is valid
      localStorage.setItem('adminAuth', password);
      setIsAuthenticated(true);
    } catch (error) {
      setAuthError('Authentication failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-md w-full bg-dreamstate-slate/30 border border-dreamstate-purple/30 rounded-lg p-8 backdrop-blur-sm">
            <h1 className="text-3xl font-bold text-dreamstate-ice mb-6 text-center">
              Admin Access
            </h1>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold mb-2 text-dreamstate-lavender">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-dreamstate-midnight border border-dreamstate-slate rounded-lg text-dreamstate-ice focus:outline-none focus:border-dreamstate-purple"
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-200 text-sm">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full px-6 py-3 bg-dreamstate-purple hover:bg-dreamstate-slate text-dreamstate-ice font-semibold rounded-lg"
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

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-dreamstate-ice">
            Admin Portal
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

        <div className="bg-dreamstate-slate/30 border border-dreamstate-purple/30 rounded-lg p-8 backdrop-blur-sm">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-dreamstate-ice mb-2">
              You&apos;re logged in as admin
            </h2>
            <p className="text-dreamstate-periwinkle">
              Ready to verify tickets at the door
            </p>
          </div>

          <div className="mt-8 p-6 bg-dreamstate-midnight/50 rounded-lg border border-dreamstate-lavender/30">
            <h3 className="text-xl font-semibold text-dreamstate-lavender mb-4">
              How to verify tickets:
            </h3>
            <ol className="space-y-3 text-dreamstate-ice">
              <li className="flex items-start">
                <span className="mr-3 font-bold text-dreamstate-purple">1.</span>
                <span>Ask the customer to show their QR code (from email or verify page)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 font-bold text-dreamstate-purple">2.</span>
                <span>Scan the QR code with your phone&apos;s camera</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 font-bold text-dreamstate-purple">3.</span>
                <span>The ticket page will open - click &quot;Verify Ticket&quot; to mark it as used</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 font-bold text-dreamstate-purple">4.</span>
                <span>You&apos;ll see their faction assignment and verification status</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
