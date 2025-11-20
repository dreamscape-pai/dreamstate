import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ticketOrders, tickets, ticketCounter, factions } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { assignFaction, getFactionIdFromIndex } from '@/lib/types';
import { randomBytes } from 'crypto';
import { sendTicketConfirmationEmail } from '@/lib/email/send';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Normalize email to lowercase for case-insensitive comparison
    const normalizedEmail = email.toLowerCase().trim();

    // Check if this email has already redeemed an in-person ticket
    const existingOrder = await db
      .select()
      .from(ticketOrders)
      .where(
        and(
          sql`LOWER(${ticketOrders.customerEmail}) = ${normalizedEmail}`,
          eq(ticketOrders.status, 'PAID_IN_PERSON')
        )
      )
      .limit(1);

    if (existingOrder.length > 0) {
      return NextResponse.json(
        { error: 'This email has already been used to redeem a ticket' },
        { status: 400 }
      );
    }

    // Generate a unique order ID for in-person tickets
    const uniqueId = randomBytes(8).toString('hex');

    // Use a default ticket type ID for in-person purchases (you can make this configurable)
    // Using ticket type 5 (First Mover - Tier 1)
    const inPersonTicketTypeId = 5;

    // 1. Create order
    const orderResult = await db.insert(ticketOrders).values({
      stripeCheckoutSessionId: `in-person-${uniqueId}`,
      stripePaymentIntentId: null,
      customerEmail: normalizedEmail,
      ticketTypeId: inPersonTicketTypeId,
      quantity: 1,
      status: 'PAID_IN_PERSON',
    }).returning({ id: ticketOrders.id });

    if (!orderResult.length) {
      throw new Error('Failed to create order');
    }

    const orderId = orderResult[0].id;

    // 2. Increment ticket counter and assign faction
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

    // Generate unique verification token
    const verificationToken = randomBytes(32).toString('hex');

    // 3. Create ticket record
    await db.insert(tickets).values({
      orderId,
      ticketNumber,
      assignedFactionId,
      verificationToken,
    });

    // 4. Get faction details
    const faction = await db
      .select()
      .from(factions)
      .where(eq(factions.id, assignedFactionId))
      .limit(1);

    if (!faction.length) {
      throw new Error('Faction not found');
    }

    console.log(`✅ In-person ticket activated: ${normalizedEmail}, Ticket #${ticketNumber}, Faction: ${faction[0].displayName}`);

    // Send confirmation email with QR code
    try {
      await sendTicketConfirmationEmail({
        customerEmail: normalizedEmail,
        ticketNumber,
        verificationToken,
        faction: {
          displayName: faction[0].displayName,
          description: faction[0].description,
          colorToken: faction[0].colorToken,
        },
        siteUrl: process.env.SITE_BASE_URL || 'https://dreamstate.dream.sc',
      });
    } catch (emailError) {
      console.error(`Failed to send email for ticket #${ticketNumber}:`, emailError);
      // Don't fail the request if email fails
    }

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
