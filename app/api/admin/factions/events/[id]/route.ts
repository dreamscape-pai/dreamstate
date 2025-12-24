import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { factionScoreEvents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const eventId = parseInt(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Delete the event
    await db
      .delete(factionScoreEvents)
      .where(eq(factionScoreEvents.id, eventId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Get the event
    const event = await db
      .select()
      .from(factionScoreEvents)
      .where(eq(factionScoreEvents.id, eventId))
      .limit(1);

    if (!event.length) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event: event[0] });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const eventId = parseInt(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
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

    // Update the event
    const updatedEvent = await db
      .update(factionScoreEvents)
      .set({
        factionId,
        points,
        description,
      })
      .where(eq(factionScoreEvents.id, eventId))
      .returning();

    if (!updatedEvent.length) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent[0],
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}
