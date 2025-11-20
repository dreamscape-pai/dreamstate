'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Header from '@/components/Header';

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

export default function AdminVerifyPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    // Check if already authenticated in session
    const saved = sessionStorage.getItem('adminAuth');
    if (saved) {
      setIsAuthenticated(true);
      setAdminPassword(saved);
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
      sessionStorage.setItem('adminAuth', password);
      setAdminPassword(password);
      setIsAuthenticated(true);
    } catch (error) {
      setAuthError('Authentication failed');
    }
  };

  const onScanSuccess = useCallback(async (decodedText: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setError('');
    setResult(null);

    try {
      // Extract token from URL
      const url = new URL(decodedText);
      const pathParts = url.pathname.split('/');
      const token = pathParts[pathParts.length - 1];

      // Verify ticket
      const response = await fetch('/api/admin/verify-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, adminPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid admin password. Please log out and try again.');
          sessionStorage.removeItem('adminAuth');
          setTimeout(() => {
            setIsAuthenticated(false);
            setPassword('');
          }, 2000);
        } else {
          throw new Error(data.error || 'Verification failed');
        }
        return;
      }

      setResult(data);

      // Auto-clear result after 5 seconds
      setTimeout(() => {
        setResult(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify ticket');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, adminPassword]);

  const onScanError = (errorMessage: string) => {
    // Ignore scan errors (happens constantly during scanning)
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setPassword('');
    setAdminPassword('');
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-dreamstate-ice">
            Ticket Verification
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

        {/* Scanner */}
        <div className="bg-dreamstate-slate/30 border border-dreamstate-purple/30 rounded-lg p-6 mb-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-dreamstate-lavender mb-4">
            Scan Ticket QR Code
          </h2>
          <div id="qr-reader" className="w-full"></div>
        </div>

        {/* Results */}
        {isProcessing && (
          <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4" />
            <p className="text-blue-200">Processing...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-6">
            <div className="text-5xl text-center mb-4">❌</div>
            <h3 className="text-2xl font-bold text-red-200 text-center mb-2">
              Invalid Ticket
            </h3>
            <p className="text-red-300 text-center">{error}</p>
          </div>
        )}

        {result && result.alreadyVerified && (
          <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-6">
            <div className="text-5xl text-center mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-yellow-200 text-center mb-4">
              Already Verified
            </h3>
            <div className="text-center space-y-2">
              <p className="text-yellow-300">
                Ticket #{result.ticketNumber}
              </p>
              <p className="text-yellow-300">
                Faction: {result.faction.displayName}
              </p>
              <p className="text-sm text-yellow-400">
                Previously verified at: {result.verifiedAt ? new Date(result.verifiedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        )}

        {result && result.success && (
          <div className="bg-green-900/30 border border-green-500 rounded-lg p-6">
            <div className="text-5xl text-center mb-4">✅</div>
            <h3 className="text-2xl font-bold text-green-200 text-center mb-4">
              Ticket Verified!
            </h3>
            <div className="text-center space-y-3">
              <p className="text-xl text-green-100">
                <strong>Ticket #{result.ticketNumber}</strong>
              </p>
              {result.customerEmail && (
                <p className="text-green-200">
                  {result.customerEmail}
                </p>
              )}
              <div className="mt-4 p-4 bg-dreamstate-slate/50 rounded-lg">
                <p className="text-2xl font-bold mb-2" style={{ color: result.faction.colorToken }}>
                  {result.faction.displayName}
                </p>
                {result.faction.description && (
                  <p className="text-sm text-dreamstate-periwinkle">
                    {result.faction.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
