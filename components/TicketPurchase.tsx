'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/types';
import type { TicketAvailability } from '@/lib/types';

// Map ticket names to chess piece images
const getTicketImage = (ticketName: string): string => {
  const name = ticketName.toLowerCase();
  if (name.includes('first mover')) return '/images/pieces/pawn.png';
  if (name.includes('early bird')) return '/images/pieces/knight.png';
  if (name.includes('general admission')) return '/images/pieces/rook.png';
  if (name.includes('donor')) return '/images/pieces/queen.png';
  return '/images/pieces/pawn.png'; // default
};

export default function TicketPurchase() {
  const [ticketTypes, setTicketTypes] = useState<TicketAvailability[]>([]);
  const [selectedTicketType, setSelectedTicketType] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/tickets/availability');
      if (!response.ok) {
        throw new Error(`Failed to fetch availability: ${response.status}`);
      }
      const data = await response.json();
      setTicketTypes(data.ticketTypes);

      // Auto-select first ticket type if none selected
      if (!selectedTicketType && data.ticketTypes.length > 0) {
        setSelectedTicketType(data.ticketTypes[0].id);
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to load ticket information');
    }
  };

  useEffect(() => {
    fetchAvailability();
    // Refresh availability every 30 seconds
    const interval = setInterval(fetchAvailability, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePurchase = async () => {
    if (!selectedTicketType) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketTypeId: selectedTicketType,
          quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error('Error creating checkout:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setLoading(false);
    }
  };

  const selectedTicket = ticketTypes.find(t => t.id === selectedTicketType);
  const maxQuantity = selectedTicket && selectedTicket.remaining !== null
    ? Math.min(10, selectedTicket.remaining)
    : 10;

  return (
    <section id="tickets" className="py-16 px-4 bg-dreamstate-midnight/50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-title font-bold text-center mb-12 text-dreamstate-ice">
          Get Your Tickets
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <div className="bg-dreamstate-slate/20 p-8 rounded-lg border border-dreamstate-purple/30 space-y-6 font-body">
          {/* Ticket Type Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-dreamstate-periwinkle uppercase tracking-wide font-subheading">
              Ticket Type
            </label>
            <div className="space-y-3">
              {ticketTypes.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketType(ticket.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTicketType === ticket.id
                      ? 'border-dreamstate-purple bg-dreamstate-purple/20'
                      : 'border-dreamstate-slate hover:border-dreamstate-lavender'
                  }`}
                >
                  <div className="flex gap-4 items-start mb-2">
                    {/* Chess piece image */}
                    <div className="flex-shrink-0 w-16 h-16 relative">
                      <Image
                        src={getTicketImage(ticket.name)}
                        alt={ticket.name}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* Ticket info */}
                    <div className="flex-1 flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{ticket.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {ticket.description}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xl font-bold text-dreamstate-lavender">
                          {formatPrice(ticket.basePriceMinor, ticket.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {ticket.remaining !== null ? (
                      ticket.remaining > 0 ? (
                        <span className={ticket.remaining < 20 ? 'text-orange-400' : ''}>
                          {ticket.remaining} tickets remaining
                        </span>
                      ) : (
                        <span className="text-red-400">Sold out</span>
                      )
                    ) : (
                      <span className="text-green-400">Available</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          {selectedTicket && (
            <div>
              <label className="block text-sm font-semibold mb-3 text-dreamstate-periwinkle uppercase tracking-wide font-subheading">
                Quantity
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-dreamstate-midnight border border-dreamstate-slate rounded-lg text-dreamstate-ice focus:outline-none focus:border-dreamstate-purple"
                disabled={!selectedTicket || (selectedTicket.remaining !== null && selectedTicket.remaining === 0)}
              >
                {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'ticket' : 'tickets'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Total Price */}
          {selectedTicket && (
            <div className="pt-4 border-t border-dreamstate-slate/50">
              <div className="flex justify-between items-center text-lg mb-4">
                <span className="font-semibold text-dreamstate-periwinkle">Total</span>
                <span className="text-2xl font-bold text-dreamstate-lavender">
                  {formatPrice(selectedTicket.basePriceMinor * quantity, selectedTicket.currency)}
                </span>
              </div>
            </div>
          )}

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={
              loading ||
              !selectedTicket ||
              (selectedTicket.remaining !== null && selectedTicket.remaining < quantity)
            }
            className="w-full px-6 py-4 bg-dreamstate-purple hover:bg-dreamstate-slate disabled:bg-gray-600 text-dreamstate-ice text-lg font-semibold rounded-lg shadow-lg"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>

          <p className="text-xs text-center text-gray-500 mt-4">
            Secure payment powered by Stripe. You will be redirected to complete your purchase.
          </p>
        </div>
      </div>
    </section>
  );
}
