import 'dotenv/config';
import { db } from '../lib/db';
import { ticketTypes } from '../lib/db/schema';
import { like } from 'drizzle-orm';

async function updateSeaTicketName() {
  try {
    console.log('Finding Southeast Asian ticket...');

    // Find the SEA ticket
    const seaTickets = await db
      .select()
      .from(ticketTypes)
      .where(like(ticketTypes.name, '%Southeast%'));

    if (seaTickets.length === 0) {
      console.log('No Southeast Asian ticket found');
      return;
    }

    console.log(`Found ticket: ${seaTickets[0].name}`);

    // Update the name
    await db
      .update(ticketTypes)
      .set({ name: 'Southeast Asian (SEA) Entry' })
      .where(like(ticketTypes.name, '%Southeast%'));

    console.log('✓ Updated ticket name to: Southeast Asian (SEA) Entry');
    process.exit(0);
  } catch (error) {
    console.error('Error updating ticket name:', error);
    process.exit(1);
  }
}

updateSeaTicketName();
