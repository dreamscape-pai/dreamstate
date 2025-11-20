CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"ticket_number" bigint NOT NULL,
	"assigned_faction_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
ALTER TABLE "ticket_orders" DROP CONSTRAINT "ticket_orders_order_sequence_number_unique";--> statement-breakpoint
ALTER TABLE "ticket_orders" DROP CONSTRAINT "ticket_orders_assigned_faction_id_factions_id_fk";
--> statement-breakpoint
DROP INDEX "sequence_idx";--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_order_id_ticket_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."ticket_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_faction_id_factions_id_fk" FOREIGN KEY ("assigned_faction_id") REFERENCES "public"."factions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ticket_number_idx" ON "tickets" USING btree ("ticket_number");--> statement-breakpoint
ALTER TABLE "ticket_orders" DROP COLUMN "order_sequence_number";--> statement-breakpoint
ALTER TABLE "ticket_orders" DROP COLUMN "assigned_faction_id";