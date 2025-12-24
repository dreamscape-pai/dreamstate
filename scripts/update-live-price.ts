import 'dotenv/config';
import { db } from '../lib/db';
import { ticketTypes } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function updateLivePrice() {
  try {
    console.log('Updating First Mover ticket to live Stripe price...');

    // Update the First Mover ticket (ID 5) with the live price ID
    const result = await db
      .update(ticketTypes)
      .set({
        stripePriceId: 'price_1SX5oNRzRBj5Yno4zUHaBl2l',
        updatedAt: new Date(),
      })
      .where(eq(ticketTypes.id, 5))
      .returning();

    if (result.length > 0) {
      console.log('✅ Successfully updated First Mover ticket:');
      console.log(`   Name: ${result[0].name}`);
      console.log(`   New Price ID: ${result[0].stripePriceId}`);
    } else {
      console.log('❌ No ticket found with ID 5');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error updating price:', error);
    process.exit(1);
  }
}

updateLivePrice();
