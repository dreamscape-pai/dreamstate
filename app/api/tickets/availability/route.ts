import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ticketTypes, ticketOrders } from '@/lib/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import type { TicketAvailabilityResponse } from '@/lib/types';

export async function GET() {
  try {
    // Get all active ticket types
    const activeTicketTypes = await db
      .select()
      .from(ticketTypes)
      .where(eq(ticketTypes.isActive, true));

    // Calculate sold tickets for each type
    const availability = await Promise.all(
      activeTicketTypes.map(async (ticketType) => {
        const soldResult = await db
          .select({
            totalSold: sql<number>`COALESCE(SUM(${ticketOrders.quantity}), 0)`,
          })
          .from(ticketOrders)
          .where(
            and(
              eq(ticketOrders.ticketTypeId, ticketType.id),
              inArray(ticketOrders.status, ['PAID', 'PENDING'])
            )
          );

        const sold = Number(soldResult[0]?.totalSold || 0);
        const remaining = ticketType.totalInventory !== null
          ? ticketType.totalInventory - sold
          : null;

        return {
          id: ticketType.id,
          name: ticketType.name,
          description: ticketType.description,
          basePriceMinor: ticketType.basePriceMinor,
          currency: ticketType.currency,
          remaining,
          sold,
          totalInventory: ticketType.totalInventory,
        };
      })
    );

    const response: TicketAvailabilityResponse = {
      ticketTypes: availability,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching ticket availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket availability' },
      { status: 500 }
    );
  }
}
