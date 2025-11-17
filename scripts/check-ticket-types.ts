import 'dotenv/config';
import { db } from '@/lib/db';
import { ticketTypes } from '@/lib/db/schema';

async function checkTicketTypes() {
  console.log('Current ticket types in database:\n');

  const types = await db.select().from(ticketTypes);

  types.forEach((type) => {
    console.log(`ID: ${type.id}`);
    console.log(`Name: ${type.name}`);
    console.log(`Stripe Price ID: ${type.stripePriceId}`);
    console.log(`Base Price: ${type.basePriceMinor / 100}`);
    console.log(`Inventory: ${type.totalInventory}`);
    console.log('---');
  });

  process.exit(0);
}

checkTicketTypes().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
