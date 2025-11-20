-- Add columns as nullable first
ALTER TABLE "tickets" ADD COLUMN "verification_token" varchar(255);--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint

-- Note: After running this migration, you must run the backfill script
-- to generate verification tokens for existing tickets before adding
-- the NOT NULL constraint
