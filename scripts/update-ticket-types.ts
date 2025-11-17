import 'dotenv/config';
import { db } from '@/lib/db';
import { ticketTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const updates = [
  {
    oldStripePriceId: 'price_1SU9uARqZ4vIrmRF79llCcC9',
    newName: 'First Mover - Tier 1',
  },
  {
    oldStripePriceId: 'price_1SUCm1RqZ4vIrmRFXTIifbAW',
    newName: 'Pathmaker Pass - Tier 2',
  },
  {
    oldStripePriceId: 'price_1SUCn9RqZ4vIrmRFRBMjcWOZ',
    newName: 'Castle Admission - Tier 3',
  },
  {
    oldStripePriceId: 'price_1SUCq4RqZ4vIrmRFQM951lNt',
    newStripePriceId: 'price_1SUM9LRqZ4vIrmRFCya8etJf',
    newName: 'Dreamweaver Invitation - Donor Tier',
  },
];

async function updateTicketTypes() {
  console.log('Updating ticket types...\n');

  for (const update of updates) {
    const oldPriceId = update.oldStripePriceId;
    const newPriceId = update.newStripePriceId || oldPriceId;
    const newName = update.newName;

    console.log(`Updating ${oldPriceId}...`);
    console.log(`  New Price ID: ${newPriceId}`);
    console.log(`  New Name: ${newName}`);

    await db
      .update(ticketTypes)
      .set({
        stripePriceId: newPriceId,
        name: newName,
      })
      .where(eq(ticketTypes.stripePriceId, oldPriceId));

    console.log('  ✓ Updated\n');
  }

  console.log('All ticket types updated successfully!');
  process.exit(0);
}

updateTicketTypes().catch((error) => {
  console.error('Error updating ticket types:', error);
  process.exit(1);
});
