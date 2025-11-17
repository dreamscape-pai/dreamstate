import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ticketOrders, factions } from '@/lib/db/schema';
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
    // Fetch order with faction details
    const orderResult = await db
      .select({
        order: ticketOrders,
        faction: factions,
      })
      .from(ticketOrders)
      .innerJoin(factions, eq(ticketOrders.assignedFactionId, factions.id))
      .where(eq(ticketOrders.stripeCheckoutSessionId, sessionId))
      .limit(1);

    if (!orderResult.length) {
      return NextResponse.json(
        { error: 'Order not found', message: 'No order found for this session. Please contact support if you completed payment.' },
        { status: 404 }
      );
    }

    const { order, faction } = orderResult[0];

    // Only return order info if payment is complete
    if (order.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Order not paid', message: 'Payment has not been completed for this order.' },
        { status: 400 }
      );
    }

    const response: OrderInfoResponse = {
      faction: {
        displayName: faction.displayName,
        description: faction.description,
        colorToken: faction.colorToken,
        iconUrl: faction.iconUrl,
      },
      orderSequenceNumber: order.orderSequenceNumber,
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
