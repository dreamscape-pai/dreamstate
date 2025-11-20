import { db } from '../lib/db';
import { ticketTypes } from '../lib/db/schema';

async function addSEATicket() {
  try {
    console.log('Adding Southeast Asian Entry ticket type...');

    await db.insert(ticketTypes).values({
      stripePriceId: 'price_1SVP23RqZ4vIrmRFEnrIRPp8',
      name: 'Southeast Asian Entry',
      description: 'Special access tier for guests from Thailand, Cambodia, Laos, Myanmar, Vietnam, Malaysia, Singapore, Indonesia, the Philippines, Brunei, and Timor-Leste.',
      currency: 'thb',
      basePriceMinor: 80000, // 800 THB
      totalInventory: null, // unlimited
      isActive: true,
    });

    console.log('✅ Southeast Asian Entry ticket type added successfully!');
    console.log('Price: 800 THB');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding ticket type:', error);
    process.exit(1);
  }
}

addSEATicket();
