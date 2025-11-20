import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tickets, factions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

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

    return NextResponse.json({
      ticketNumber: Number(ticket[0].ticketNumber),
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
