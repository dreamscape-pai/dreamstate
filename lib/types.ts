import { z } from 'zod';

// Faction names
export const FACTION_NAMES = ['DEJA_VU', 'LUCID', 'HYPNOTIC', 'DRIFT'] as const;
export type FactionName = typeof FACTION_NAMES[number];

// API request/response types
export const checkoutSessionSchema = z.object({
  ticketTypeId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(10),
  customerEmail: z.string().email().optional(),
});

export type CheckoutSessionRequest = z.infer<typeof checkoutSessionSchema>;

export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

export interface TicketAvailability {
  id: number;
  name: string;
  description: string;
  basePriceMinor: number;
  currency: string;
  remaining: number | null;
  sold: number;
  totalInventory: number | null;
}

export interface TicketAvailabilityResponse {
  ticketTypes: TicketAvailability[];
}

export interface FactionInfo {
  displayName: string;
  description: string;
  colorToken: string;
  iconUrl: string | null;
}

export interface OrderInfoResponse {
  faction: FactionInfo;
  orderSequenceNumber: number;
  quantity: number;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}

// Faction assignment helper
export function assignFaction(orderSequenceNumber: number): number {
  // Returns 0-3 for faction index
  return (orderSequenceNumber - 1) % 4;
}

// Map faction index to faction ID (assumes factions are seeded in order)
export function getFactionIdFromIndex(index: number): number {
  return index + 1; // Faction IDs are 1-indexed in database
}

// Price formatting helper
export function formatPrice(priceMinor: number, currency: string): string {
  const major = priceMinor / 100;

  if (currency.toLowerCase() === 'thb') {
    return `฿${major.toFixed(2)}`;
  }

  return `${currency.toUpperCase()} ${major.toFixed(2)}`;
}
