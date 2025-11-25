import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { db } from '../lib/db';

async function applyMigration() {
  try {
    console.log('Applying migration: Adding customer_name column to ticket_orders...');

    await db.execute(sql`ALTER TABLE "ticket_orders" ADD COLUMN IF NOT EXISTS "customer_name" varchar(255)`);

    console.log('✓ Migration applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

applyMigration();
