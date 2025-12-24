CREATE TABLE "faction_score_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"faction_id" integer NOT NULL,
	"points" integer NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "faction_score_events" ADD CONSTRAINT "faction_score_events_faction_id_factions_id_fk" FOREIGN KEY ("faction_id") REFERENCES "public"."factions"("id") ON DELETE no action ON UPDATE no action;