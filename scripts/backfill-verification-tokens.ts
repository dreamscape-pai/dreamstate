import 'dotenv/config';
import { db } from '../lib/db';
import { tickets } from '../lib/db/schema';
import { isNull, eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

async function backfillVerificationTokens() {
  console.log('🔄 Backfilling verification tokens for existing tickets...');

  // Get all tickets without verification tokens
  const ticketsWithoutTokens = await db
    .select()
    .from(tickets)
    .where(isNull(tickets.verificationToken));

  console.log(`Found ${ticketsWithoutTokens.length} tickets without verification tokens`);

  // Update each ticket with a unique verification token
  for (const ticket of ticketsWithoutTokens) {
    const token = randomBytes(32).toString('hex');
    await db
      .update(tickets)
      .set({ verificationToken: token })
      .where(eq(tickets.id, ticket.id));

    console.log(`✅ Generated token for ticket #${ticket.ticketNumber}`);
  }

  console.log('✅ Backfill completed!');
}

backfillVerificationTokens()
  .catch((error) => {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
