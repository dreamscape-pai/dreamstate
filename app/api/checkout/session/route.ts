import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { ticketTypes, ticketOrders } from '@/lib/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { checkoutSessionSchema, type CheckoutSessionResponse } from '@/lib/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = checkoutSessionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', message: validationResult.error.message },
        { status: 400 }
      );
    }

    const { ticketTypeId, quantity, customerEmail } = validationResult.data;

    // Fetch ticket type
    const ticketType = await db
      .select()
      .from(ticketTypes)
      .where(and(eq(ticketTypes.id, ticketTypeId), eq(ticketTypes.isActive, true)))
      .limit(1);

    if (!ticketType.length) {
      return NextResponse.json(
        { error: 'Ticket type not found or inactive' },
        { status: 404 }
      );
    }

    const ticket = ticketType[0];

    // Check availability
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
        return NextResponse.json(
          { error: 'Not enough tickets available', message: `Only ${remaining} tickets remaining` },
          { status: 400 }
        );
      }
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: ticket.stripePriceId,
          quantity,
        },
      ],
      success_url: `${process.env.SITE_BASE_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_BASE_URL}/?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        ticketTypeId: ticket.id.toString(),
        quantity: quantity.toString(),
      },
      payment_intent_data: {
        metadata: {
          ticketTypeId: ticket.id.toString(),
          quantity: quantity.toString(),
        },
      },
    });

    const response: CheckoutSessionResponse = {
      url: session.url!,
      sessionId: session.id,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
