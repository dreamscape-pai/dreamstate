import 'dotenv/config';
import { db } from '../lib/db';
import { ticketTypes } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function updateAllLivePrices() {
  try {
    console.log('Updating all tickets to live Stripe prices...\n');

    const updates = [
      { id: 5, name: 'First Mover - Tier 1', priceId: 'price_1SX5oNRzRBj5Yno4zUHaBl2l' },
      { id: 6, name: 'Pathmaker - Tier 2', priceId: 'price_1SX5oJRzRBj5Yno4WIcK4Pf5' },
      { id: 7, name: 'Castle Builder - Tier 3', priceId: 'price_1SX5oHRzRBj5Yno4qj5hpuV1' },
      { id: 8, name: 'Dreamweaver (Donor)', priceId: 'price_1SX5oFRzRBj5Yno4wfh2MBEJ' },
    ];

    for (const update of updates) {
      const result = await db
        .update(ticketTypes)
        .set({
          stripePriceId: update.priceId,
          updatedAt: new Date(),
        })
        .where(eq(ticketTypes.id, update.id))
        .returning();

      if (result.length > 0) {
        console.log(`✅ ${result[0].name}`);
        console.log(`   Price ID: ${result[0].stripePriceId}\n`);
      } else {
        console.log(`❌ Failed to update ticket ID ${update.id}\n`);
      }
    }

    console.log('All done! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('Error updating prices:', error);
    process.exit(1);
  }
}

updateAllLivePrices();
