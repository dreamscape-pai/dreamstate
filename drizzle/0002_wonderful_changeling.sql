ALTER TYPE "public"."order_status" ADD VALUE 'PAID_IN_PERSON' BEFORE 'CANCELED';--> statement-breakpoint
CREATE TABLE "physical_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"ticket_type_id" integer NOT NULL,
	"is_redeemed" boolean DEFAULT false NOT NULL,
	"redeemed_at" timestamp,
	"order_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "physical_tickets_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "physical_tickets" ADD CONSTRAINT "physical_tickets_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "public"."ticket_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "physical_tickets" ADD CONSTRAINT "physical_tickets_order_id_ticket_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."ticket_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "physical_ticket_code_idx" ON "physical_tickets" USING btree ("code");