-- Add NOT NULL constraint and unique index for verification tokens
ALTER TABLE "tickets" ALTER COLUMN "verification_token" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "verification_token_idx" ON "tickets" USING btree ("verification_token");--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_verification_token_unique" UNIQUE("verification_token");
