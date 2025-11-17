import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { ticketOrders, ticketTypes, ticketCounter, factions } from '@/lib/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { assignFaction, getFactionIdFromIndex } from '@/lib/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await processCompletedCheckout(session);
    } catch (error) {
      console.error('Error processing checkout:', error);
      return NextResponse.json(
        { error: 'Failed to process checkout' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

async function processCompletedCheckout(session: Stripe.Checkout.Session) {
  const ticketTypeId = parseInt(session.metadata?.ticketTypeId || '0');
  const quantity = parseInt(session.metadata?.quantity || '0');
  const customerEmail = session.customer_details?.email || session.customer_email || '';
  const paymentIntentId = session.payment_intent as string;

  if (!ticketTypeId || !quantity || !customerEmail) {
    throw new Error('Missing required metadata in checkout session');
  }

  // Start transaction-like operations
  // Note: Neon serverless doesn't support traditional transactions,
  // so we'll handle this carefully with error handling

  try {
    // 1. Verify ticket type exists and check inventory
    const ticketType = await db
      .select()
      .from(ticketTypes)
      .where(eq(ticketTypes.id, ticketTypeId))
      .limit(1);

    if (!ticketType.length) {
      throw new Error(`Ticket type ${ticketTypeId} not found`);
    }

    const ticket = ticketType[0];

    // 2. Check if order already exists (idempotency)
    const existingOrder = await db
      .select()
      .from(ticketOrders)
      .where(eq(ticketOrders.stripeCheckoutSessionId, session.id))
      .limit(1);

    if (existingOrder.length > 0) {
      console.log(`Order already processed for session ${session.id}`);
      return;
    }

    // 3. Verify inventory if limited
    if (ticket.totalInventory !== null) {
      const soldResult = await db
        .select({
          totalSold: sql<number>`COALESCE(SUM(${ticketOrders.quantity}), 0)`,
        })
        .from(ticketOrders)
        .where(
          and(
            eq(ticketOrders.ticketTypeId, ticket.id),
            inArray(ticketOrders.status, ['PAID', 'PENDING'])
          )
        );

      const sold = Number(soldResult[0]?.totalSold || 0);
      const remaining = ticket.totalInventory - sold;

      if (remaining < quantity) {
        throw new Error(`Insufficient inventory: ${remaining} remaining, ${quantity} requested`);
      }
    }

    // 4. Increment ticket counter atomically and get order sequence number
    const counterResult = await db
      .update(ticketCounter)
      .set({ currentValue: sql`${ticketCounter.currentValue} + 1` })
      .where(eq(ticketCounter.id, 1))
      .returning({ newValue: ticketCounter.currentValue });

    if (!counterResult.length) {
      throw new Error('Failed to increment ticket counter');
    }

    const orderSequenceNumber = counterResult[0].newValue;

    // 5. Calculate faction assignment
    const factionIndex = assignFaction(orderSequenceNumber);
    const assignedFactionId = getFactionIdFromIndex(factionIndex);

    // 6. Verify faction exists
    const faction = await db
      .select()
      .from(factions)
      .where(eq(factions.id, assignedFactionId))
      .limit(1);

    if (!faction.length) {
      throw new Error(`Faction ${assignedFactionId} not found`);
    }

    // 7. Create the ticket order
    await db.insert(ticketOrders).values({
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      customerEmail,
      ticketTypeId,
      quantity,
      orderSequenceNumber,
      assignedFactionId,
      status: 'PAID',
    });

    console.log(
      `✅ Order created: Session ${session.id}, Sequence #${orderSequenceNumber}, Faction: ${faction[0].displayName}`
    );

    // TODO: Send confirmation email to customer with faction assignment
  } catch (error) {
    console.error('Error in processCompletedCheckout:', error);
    throw error;
  }
}

// Disable body parsing for webhooks
export const runtime = 'edge';
