import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log('⏳ Creating faction_score_events table...');

  // Create the table
  await sql`
    CREATE TABLE IF NOT EXISTS "faction_score_events" (
      "id" serial PRIMARY KEY NOT NULL,
      "faction_id" integer NOT NULL,
      "points" integer NOT NULL,
      "description" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `;

  // Add foreign key constraint
  await sql`
    ALTER TABLE "faction_score_events"
    DROP CONSTRAINT IF EXISTS "faction_score_events_faction_id_factions_id_fk";
  `;

  await sql`
    ALTER TABLE "faction_score_events"
    ADD CONSTRAINT "faction_score_events_faction_id_factions_id_fk"
    FOREIGN KEY ("faction_id") REFERENCES "public"."factions"("id")
    ON DELETE no action ON UPDATE no action;
  `;

  console.log('✅ Migration completed successfully');
  process.exit(0);
};

runMigration().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
