import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { factionScoreEvents, factions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Get password from Authorization header
    const authHeader = request.headers.get('authorization');
    const password = authHeader?.replace('Bearer ', '');

    // Verify admin password
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { factionId, points, description } = body;

    // Validate inputs
    if (!factionId || typeof points !== 'number' || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: factionId, points, description' },
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

    // Create the score event
    const newEvent = await db
      .insert(factionScoreEvents)
      .values({
        factionId,
        points,
        description,
      })
      .returning();

    return NextResponse.json({
      success: true,
      event: newEvent[0],
    });
  } catch (error) {
    console.error('Error adding score event:', error);
    return NextResponse.json(
      { error: 'Failed to add score event' },
      { status: 500 }
    );
  }
}
