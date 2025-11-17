import 'dotenv/config';
import { db } from '@/lib/db';
import { ticketTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Delete all existing ticket types and recreate with correct data
async function fixTicketTypes() {
  console.log('Fixing ticket types...\n');

  // Delete all existing ticket types
  console.log('Deleting all existing ticket types...');
  await db.delete(ticketTypes);
  console.log('✓ Deleted all ticket types\n');

  // Insert the correct ticket types
  const correctTicketTypes = [
    {
      stripePriceId: 'price_1SU9uARqZ4vIrmRF79llCcC9',
      name: 'First Mover - Tier 1',
      description: 'Early access tier with exclusive benefits',
      basePriceMinor: 90000, // 900 THB
      currency: 'thb',
      totalInventory: 30,
      isActive: true,
    },
    {
      stripePriceId: 'price_1SUCm1RqZ4vIrmRFXTIifbAW',
      name: 'Pathmaker Pass - Tier 2',
      description: 'Premium tier with enhanced experience',
      basePriceMinor: 120000, // 1200 THB
      currency: 'thb',
      totalInventory: 30,
      isActive: true,
    },
    {
      stripePriceId: 'price_1SUCn9RqZ4vIrmRFRBMjcWOZ',
      name: 'Castle Admission - Tier 3',
      description: 'Standard admission with full access',
      basePriceMinor: 150000, // 1500 THB
      currency: 'thb',
      totalInventory: 240,
      isActive: true,
    },
    {
      stripePriceId: 'price_1SUM9LRqZ4vIrmRFCya8etJf',
      name: 'Dreamweaver Invitation - Donor Tier',
      description: 'Support the dream with unlimited availability',
      basePriceMinor: 200000, // 2000 THB
      currency: 'thb',
      totalInventory: null, // Unlimited
      isActive: true,
    },
  ];

  console.log('Inserting correct ticket types...');
  for (const ticketType of correctTicketTypes) {
    await db.insert(ticketTypes).values(ticketType);
    console.log(`✓ Added: ${ticketType.name} (${ticketType.stripePriceId})`);
  }

  console.log('\n✅ All ticket types fixed successfully!');
  process.exit(0);
}

fixTicketTypes().catch((error) => {
  console.error('Error fixing ticket types:', error);
  process.exit(1);
});
