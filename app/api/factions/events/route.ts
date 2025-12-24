import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { factionScoreEvents } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get all events from all factions, ordered by most recent first
    const events = await db
      .select()
      .from(factionScoreEvents)
      .orderBy(desc(factionScoreEvents.createdAt));

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching all faction events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch faction events' },
      { status: 500 }
    );
  }
}
