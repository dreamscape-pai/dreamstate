import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tickets, factions, ticketOrders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json(
        { error: 'Missing verification token' },
        { status: 400 }
      );
    }

    // Find ticket by verification token
    const ticket = await db
      .select({
        ticketNumber: tickets.ticketNumber,
        factionId: tickets.assignedFactionId,
        isVerified: tickets.isVerified,
        verifiedAt: tickets.verifiedAt,
        purchaseMethod: tickets.purchaseMethod,
        orderId: tickets.orderId,
      })
      .from(tickets)
      .where(eq(tickets.verificationToken, token))
      .limit(1);

    if (!ticket.length) {
      return NextResponse.json(
        { error: 'Invalid ticket' },
        { status: 404 }
      );
    }

    // Get faction info
    const faction = await db
      .select()
      .from(factions)
      .where(eq(factions.id, ticket[0].factionId))
      .limit(1);

    if (!faction.length) {
      return NextResponse.json(
        { error: 'Faction not found' },
        { status: 500 }
      );
    }

    // Get order info
    const order = await db
      .select({
        customerName: ticketOrders.customerName,
        customerEmail: ticketOrders.customerEmail,
      })
      .from(ticketOrders)
      .where(eq(ticketOrders.id, ticket[0].orderId))
      .limit(1);

    return NextResponse.json({
      ticketNumber: Number(ticket[0].ticketNumber),
      isVerified: ticket[0].isVerified,
      verifiedAt: ticket[0].verifiedAt,
      purchaseMethod: ticket[0].purchaseMethod,
      customerName: order[0]?.customerName || null,
      customerEmail: order[0]?.customerEmail || null,
      faction: {
        displayName: faction[0].displayName,
        description: faction[0].description,
        colorToken: faction[0].colorToken,
      },
    });
  } catch (error) {
    console.error('Error fetching ticket info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket info' },
      { status: 500 }
    );
  }
}
