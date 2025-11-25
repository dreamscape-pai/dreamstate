import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tickets, factions, ticketOrders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, adminPassword } = body;

    // Verify admin password
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid admin password' },
        { status: 401 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Missing verification token' },
        { status: 400 }
      );
    }

    // Find ticket by verification token
    const ticket = await db
      .select({
        id: tickets.id,
        ticketNumber: tickets.ticketNumber,
        isVerified: tickets.isVerified,
        verifiedAt: tickets.verifiedAt,
        orderId: tickets.orderId,
        factionId: tickets.assignedFactionId,
      })
      .from(tickets)
      .where(eq(tickets.verificationToken, token))
      .limit(1);

    if (!ticket.length) {
      return NextResponse.json(
        { error: 'Invalid ticket - not found' },
        { status: 404 }
      );
    }

    const ticketData = ticket[0];

    // Check if already verified
    if (ticketData.isVerified) {
      // Get faction info for already verified ticket
      const faction = await db
        .select()
        .from(factions)
        .where(eq(factions.id, ticketData.factionId))
        .limit(1);

      return NextResponse.json({
        alreadyVerified: true,
        verifiedAt: ticketData.verifiedAt,
        ticketNumber: Number(ticketData.ticketNumber),
        faction: faction[0] ? {
          displayName: faction[0].displayName,
          colorToken: faction[0].colorToken,
        } : null,
      });
    }

    // Get order info
    const order = await db
      .select()
      .from(ticketOrders)
      .where(eq(ticketOrders.id, ticketData.orderId))
      .limit(1);

    // Get faction info
    const faction = await db
      .select()
      .from(factions)
      .where(eq(factions.id, ticketData.factionId))
      .limit(1);

    if (!faction.length) {
      return NextResponse.json(
        { error: 'Faction not found' },
        { status: 500 }
      );
    }

    // Mark ticket as verified
    await db
      .update(tickets)
      .set({
        isVerified: true,
        verifiedAt: new Date(),
      })
      .where(eq(tickets.id, ticketData.id));

    console.log(`✅ Ticket #${ticketData.ticketNumber} verified at door`);

    return NextResponse.json({
      success: true,
      ticketNumber: Number(ticketData.ticketNumber),
      customerName: order[0]?.customerName,
      customerEmail: order[0]?.customerEmail,
      faction: {
        displayName: faction[0].displayName,
        description: faction[0].description,
        colorToken: faction[0].colorToken,
      },
    });
  } catch (error) {
    console.error('Error verifying ticket:', error);
    return NextResponse.json(
      { error: 'Failed to verify ticket' },
      { status: 500 }
    );
  }
}
