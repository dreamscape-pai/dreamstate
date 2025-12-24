import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { factions, factionScoreEvents } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get all factions with their total scores
    const allFactions = await db.select().from(factions);

    const factionsWithScores = await Promise.all(
      allFactions.map(async (faction) => {
        const scoreResult = await db
          .select({
            totalPoints: sql<number>`COALESCE(SUM(${factionScoreEvents.points}), 0)`,
          })
          .from(factionScoreEvents)
          .where(eq(factionScoreEvents.factionId, faction.id));

        const totalPoints = Number(scoreResult[0]?.totalPoints || 0);

        return {
          id: faction.id,
          name: faction.name,
          displayName: faction.displayName,
          description: faction.description,
          colorToken: faction.colorToken,
          iconUrl: faction.iconUrl,
          totalPoints,
        };
      })
    );

    return NextResponse.json({ factions: factionsWithScores });
  } catch (error) {
    console.error('Error fetching faction scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch faction scores' },
      { status: 500 }
    );
  }
}
