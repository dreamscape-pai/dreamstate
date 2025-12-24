import 'dotenv/config';
import { db } from '../lib/db';
import { ticketTypes } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function updateSEAPrice() {
  try {
    const result = await db
      .update(ticketTypes)
      .set({
        stripePriceId: 'price_1SX5oCRzRBj5Yno4gvKx1bxW',
        updatedAt: new Date(),
      })
      .where(eq(ticketTypes.id, 9))
      .returning();

    console.log('✅ Southeast Asian Entry');
    console.log('   Price ID:', result[0].stripePriceId);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateSEAPrice();
