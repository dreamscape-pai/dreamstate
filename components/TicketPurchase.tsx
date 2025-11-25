'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/types';
import type { TicketAvailability } from '@/lib/types';

// Map ticket names to chess piece images
const getTicketImage = (ticketName: string): string => {
  const name = ticketName.toLowerCase();
  if (name.includes('first mover') || name.includes('tier 1')) return '/images/pieces/knight.png';
  if (name.includes('pathmaker') || name.includes('tier 2')) return '/images/pieces/bishop.png';
  if (name.includes('castle') || name.includes('tier 3')) return '/images/pieces/rook.png';
  if (name.includes('dreamweaver') || name.includes('donor')) return '/images/pieces/queen.png';
  if (name.includes('southeast asian')) return '/images/pieces/southeast-asia.png';
  return '/images/pieces/knight.png'; // default
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

      // Auto-select lowest priced available ticket (excluding SEA)
      if (!selectedTicketType && data.ticketTypes.length > 0) {
        const availableTickets = data.ticketTypes.filter(
          (t: TicketAvailability) =>
            (t.remaining === null || t.remaining > 0) &&
            !t.name.toLowerCase().includes('southeast asian')
        );
        if (availableTickets.length > 0) {
          // Tickets are already sorted by price, so first non-SEA is lowest price
          setSelectedTicketType(availableTickets[0].id);
        }
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

        {ticketTypes.length === 0 && !error ? (
          <div className="bg-dreamstate-slate/20 p-12 rounded-lg border border-dreamstate-purple/30">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dreamstate-lavender"></div>
              <p className="text-dreamstate-periwinkle text-lg font-body">Loading tickets...</p>
            </div>
          </div>
        ) : (
          <div className="bg-dreamstate-slate/20 p-8 rounded-lg border border-dreamstate-purple/30 space-y-6 font-body">
          {/* Order Summary */}
          {selectedTicket && (
            <div className="space-y-3 pb-6 border-b border-white/20">
              {/* Item line */}
              <div className="flex justify-between items-center text-base text-dreamstate-ice">
                <span>{selectedTicket.name}</span>
                <span className="text-gray-400">
                  {formatPrice(selectedTicket.basePriceMinor, selectedTicket.currency)} × {quantity}
                </span>
              </div>

              {/* Total line */}
              <div className="flex justify-between items-center text-lg pt-3 border-t border-dreamstate-slate/30">
                <span className="font-semibold text-dreamstate-periwinkle">Total</span>
                <span className="text-2xl font-bold text-dreamstate-lavender">
                  {formatPrice(selectedTicket.basePriceMinor * quantity, selectedTicket.currency)}
                </span>
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          {selectedTicket && (
            <div>
              <label className="block text-lg font-semibold mb-3 text-dreamstate-periwinkle uppercase tracking-wide font-subheading">
                Quantity
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full pl-4 pr-12 py-3 bg-dreamstate-midnight border border-dreamstate-slate rounded-lg text-dreamstate-ice focus:outline-none focus:border-dreamstate-purple appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgb(199,210,254)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundSize: '1.5rem',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat'
                }}
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

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={
              loading ||
              !selectedTicket ||
              (selectedTicket && selectedTicket.remaining !== null && selectedTicket.remaining < quantity)
            }
            className="w-full px-6 py-4 bg-dreamstate-purple hover:bg-dreamstate-slate disabled:bg-gray-600 text-dreamstate-ice text-lg font-semibold rounded-lg shadow-lg"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>

          <p className="text-xs text-center text-gray-500">
            Secure payment powered by Stripe. You will be redirected to complete your purchase.
          </p>

          {/* Ticket Type Selection */}
          <div>
            <label className="block text-lg font-semibold mb-3 text-dreamstate-periwinkle uppercase tracking-wide font-subheading">
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
                        {ticket.name.toLowerCase().includes('southeast asian') && (
                          <p className="text-sm text-yellow-400 mt-1 font-semibold">
                            Passport or Thai ID card required
                          </p>
                        )}
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
                    {ticket.remaining !== null && (
                      ticket.remaining > 0 ? (
                        <span className={ticket.remaining < 20 ? 'text-orange-400' : ''}>
                          {ticket.remaining} tickets remaining
                        </span>
                      ) : (
                        <span className="text-red-400">Sold out</span>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fine Print */}
          <div className="mt-8 bg-dreamstate-slate/20 p-6 rounded-lg border border-dreamstate-purple/30 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-dreamstate-lavender font-subheading uppercase tracking-wide">
              Important Information
            </h3>
            <ul className="space-y-3 text-sm text-dreamstate-ice font-body">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Tickets are for ages 18 and up only. Do not purchase a ticket for anyone under 18.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Tickets are non-refundable. To inquire about transferring your ticket, please email <a href="mailto:dreamscape.pai@gmail.com" className="text-dreamstate-lavender hover:underline">dreamscape.pai@gmail.com</a>.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Dreamstate is an interactive, movement-based experience that involves navigating the Dreamscape venue. If you have any accessibility needs or mobility restrictions, please contact us by email prior to purchasing.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>By attending Dreamstate, you acknowledge that photo and video may be captured for event documentation and promotional purposes for Dreamscape.</span>
              </li>
            </ul>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
