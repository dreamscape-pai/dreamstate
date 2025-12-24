import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { factionScoreEvents, factions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const factionId = parseInt(id);

    if (isNaN(factionId)) {
      return NextResponse.json(
        { error: 'Invalid faction ID' },
        { status: 400 }
      );
    }

    // Verify faction exists
    const faction = await db
      .select()
      .from(factions)
      .where(eq(factions.id, factionId))
      .limit(1);

    if (!faction.length) {
      return NextResponse.json(
        { error: 'Faction not found' },
        { status: 404 }
      );
    }

    // Get all events for this faction, ordered by most recent first
    const events = await db
      .select()
      .from(factionScoreEvents)
      .where(eq(factionScoreEvents.factionId, factionId))
      .orderBy(desc(factionScoreEvents.createdAt));

    return NextResponse.json({
      faction: faction[0],
      events,
    });
  } catch (error) {
    console.error('Error fetching faction events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch faction events' },
      { status: 500 }
    );
  }
}
