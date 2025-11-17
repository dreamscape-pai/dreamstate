CREATE TYPE "public"."faction" AS ENUM('DEJA_VU', 'LUCID', 'HYPNOTIC', 'DRIFT');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'PAID', 'CANCELED', 'REFUNDED');--> statement-breakpoint
CREATE TABLE "factions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" "faction" NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"color_token" varchar(50) NOT NULL,
	"icon_url" varchar(255),
	CONSTRAINT "factions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ticket_counter" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"current_value" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"stripe_checkout_session_id" varchar(255) NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"customer_email" varchar(255) NOT NULL,
	"ticket_type_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"order_sequence_number" bigint NOT NULL,
	"assigned_faction_id" integer NOT NULL,
	"status" "order_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ticket_orders_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id"),
	CONSTRAINT "ticket_orders_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id"),
	CONSTRAINT "ticket_orders_order_sequence_number_unique" UNIQUE("order_sequence_number")
);
--> statement-breakpoint
CREATE TABLE "ticket_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"stripe_price_id" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"currency" varchar(3) DEFAULT 'thb' NOT NULL,
	"base_price_minor" integer NOT NULL,
	"total_inventory" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ticket_types_stripe_price_id_unique" UNIQUE("stripe_price_id")
);
--> statement-breakpoint
ALTER TABLE "ticket_orders" ADD CONSTRAINT "ticket_orders_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "public"."ticket_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_orders" ADD CONSTRAINT "ticket_orders_assigned_faction_id_factions_id_fk" FOREIGN KEY ("assigned_faction_id") REFERENCES "public"."factions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "session_idx" ON "ticket_orders" USING btree ("stripe_checkout_session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sequence_idx" ON "ticket_orders" USING btree ("order_sequence_number");