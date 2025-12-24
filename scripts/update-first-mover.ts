import 'dotenv/config';
import { db } from '../lib/db';
import { ticketTypes } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function updateFirstMover() {
  try {
    const result = await db
      .update(ticketTypes)
      .set({
        stripePriceId: 'price_1SXEXhRzRBj5Yno40jqb49fD',
        updatedAt: new Date(),
      })
      .where(eq(ticketTypes.id, 5))
      .returning();

    console.log('✅ First Mover - Tier 1');
    console.log('   New Price ID:', result[0].stripePriceId);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateFirstMover();
