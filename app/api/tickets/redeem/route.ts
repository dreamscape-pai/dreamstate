import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { physicalTickets, ticketOrders, tickets, ticketCounter, ticketTypes, factions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { assignFaction, getFactionIdFromIndex } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, email } = body;

    if (!code || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Find the physical ticket
    const physicalTicket = await db
      .select()
      .from(physicalTickets)
      .where(eq(physicalTickets.code, code))
      .limit(1);

    if (!physicalTicket.length) {
      return NextResponse.json(
        { error: 'Invalid ticket code' },
        { status: 404 }
      );
    }

    const ticket = physicalTicket[0];

    // 2. Check if already redeemed
    if (ticket.isRedeemed) {
      return NextResponse.json(
        { error: 'This ticket has already been redeemed' },
        { status: 400 }
      );
    }

    // 3. Get ticket type
    const ticketType = await db
      .select()
      .from(ticketTypes)
      .where(eq(ticketTypes.id, ticket.ticketTypeId))
      .limit(1);

    if (!ticketType.length) {
      return NextResponse.json(
        { error: 'Ticket type not found' },
        { status: 404 }
      );
    }

    // 4. Create order
    const orderResult = await db.insert(ticketOrders).values({
      stripeCheckoutSessionId: `in-person-${code}`,
      stripePaymentIntentId: null,
      customerEmail: email,
      ticketTypeId: ticket.ticketTypeId,
      quantity: 1,
      status: 'PAID_IN_PERSON',
    }).returning({ id: ticketOrders.id });

    if (!orderResult.length) {
      throw new Error('Failed to create order');
    }

    const orderId = orderResult[0].id;

    // 5. Increment ticket counter and assign faction
    const counterResult = await db
      .update(ticketCounter)
      .set({ currentValue: sql`${ticketCounter.currentValue} + 1` })
      .where(eq(ticketCounter.id, 1))
      .returning({ newValue: ticketCounter.currentValue });

    if (!counterResult.length) {
      throw new Error('Failed to increment ticket counter');
    }

    const ticketNumber = counterResult[0].newValue;
    const factionIndex = assignFaction(ticketNumber);
    const assignedFactionId = getFactionIdFromIndex(factionIndex);

    // 6. Create ticket record
    await db.insert(tickets).values({
      orderId,
      ticketNumber,
      assignedFactionId,
    });

    // 7. Mark physical ticket as redeemed
    await db
      .update(physicalTickets)
      .set({
        isRedeemed: true,
        redeemedAt: new Date(),
        orderId,
      })
      .where(eq(physicalTickets.id, ticket.id));

    // 8. Get faction details
    const faction = await db
      .select()
      .from(factions)
      .where(eq(factions.id, assignedFactionId))
      .limit(1);

    if (!faction.length) {
      throw new Error('Faction not found');
    }

    console.log(`✅ In-person ticket redeemed: Code ${code}, Ticket #${ticketNumber}, Faction: ${faction[0].displayName}`);

    return NextResponse.json({
      success: true,
      ticketNumber,
      faction: {
        displayName: faction[0].displayName,
        description: faction[0].description,
        colorToken: faction[0].colorToken,
        iconUrl: faction[0].iconUrl,
      },
    });
  } catch (error) {
    console.error('Error redeeming ticket:', error);
    return NextResponse.json(
      { error: 'Failed to redeem ticket' },
      { status: 500 }
    );
  }
}
