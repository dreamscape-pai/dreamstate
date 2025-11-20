import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ticketOrders, factions, tickets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { OrderInfoResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing session_id parameter' },
      { status: 400 }
    );
  }

  try {
    // Fetch order
    const orderResult = await db
      .select()
      .from(ticketOrders)
      .where(eq(ticketOrders.stripeCheckoutSessionId, sessionId))
      .limit(1);

    if (!orderResult.length) {
      return NextResponse.json(
        { error: 'Order not found', message: 'No order found for this session. Please contact support if you completed payment.' },
        { status: 404 }
      );
    }

    const order = orderResult[0];

    // Only return order info if payment is complete
    if (order.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Order not paid', message: 'Payment has not been completed for this order.' },
        { status: 400 }
      );
    }

    // Fetch all tickets for this order with their factions
    const ticketsResult = await db
      .select({
        ticket: tickets,
        faction: factions,
      })
      .from(tickets)
      .innerJoin(factions, eq(tickets.assignedFactionId, factions.id))
      .where(eq(tickets.orderId, order.id))
      .orderBy(tickets.ticketNumber);

    const response: OrderInfoResponse = {
      tickets: ticketsResult.map(({ ticket, faction }) => ({
        ticketNumber: ticket.ticketNumber,
        faction: {
          displayName: faction.displayName,
          description: faction.description,
          colorToken: faction.colorToken,
          iconUrl: faction.iconUrl,
        },
      })),
      quantity: order.quantity,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order information' },
      { status: 500 }
    );
  }
}
