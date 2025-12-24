import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tickets, ticketOrders, ticketTypes, factions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  // Verify admin password
  const authHeader = request.headers.get('authorization');
  const adminPassword = authHeader?.replace('Bearer ', '');

  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Fetch all tickets with related data
    const allTickets = await db
      .select({
        ticketNumber: tickets.ticketNumber,
        orderId: tickets.orderId,
        purchaseMethod: tickets.purchaseMethod,
        verificationToken: tickets.verificationToken,
        factionName: factions.displayName,
        createdAt: tickets.createdAt,
        isVerified: tickets.isVerified,
        verifiedAt: tickets.verifiedAt,
      })
      .from(tickets)
      .innerJoin(factions, eq(tickets.assignedFactionId, factions.id))
      .orderBy(desc(tickets.createdAt));

    // Get order info for each ticket
    const ticketsWithOrderInfo = await Promise.all(
      allTickets.map(async (ticket) => {
        const order = await db
          .select({
            customerName: ticketOrders.customerName,
            customerEmail: ticketOrders.customerEmail,
            ticketTypeId: ticketOrders.ticketTypeId,
            stripePaymentIntentId: ticketOrders.stripePaymentIntentId,
          })
          .from(ticketOrders)
          .where(eq(ticketOrders.id, ticket.orderId))
          .limit(1);

        const ticketType = order[0]?.ticketTypeId
          ? await db
              .select({ name: ticketTypes.name })
              .from(ticketTypes)
              .where(eq(ticketTypes.id, order[0].ticketTypeId))
              .limit(1)
          : null;

        return {
          ticketNumber: ticket.ticketNumber,
          verificationToken: ticket.verificationToken,
          customerName: order[0]?.customerName || null,
          customerEmail: order[0]?.customerEmail || 'Unknown',
          purchaseMethod: ticket.purchaseMethod,
          ticketTypeName: ticketType?.[0]?.name || 'Unknown',
          factionName: ticket.factionName,
          createdAt: ticket.createdAt.toISOString(),
          isVerified: ticket.isVerified,
          verifiedAt: ticket.verifiedAt?.toISOString() || null,
          stripePaymentIntentId: order[0]?.stripePaymentIntentId || null,
        };
      })
    );

    return NextResponse.json({
      tickets: ticketsWithOrderInfo,
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}
