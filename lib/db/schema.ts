import { pgTable, serial, varchar, text, integer, boolean, bigint, timestamp, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';

// Faction enum
export const factionEnum = pgEnum('faction', ['DEJA_VU', 'LUCID', 'HYPNOTIC', 'DRIFT']);

// Order status enum
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'PAID', 'PAID_IN_PERSON', 'CANCELED', 'REFUNDED']);

// Faction table
export const factions = pgTable('factions', {
  id: serial('id').primaryKey(),
  name: factionEnum('name').notNull().unique(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  colorToken: varchar('color_token', { length: 50 }).notNull(),
  iconUrl: varchar('icon_url', { length: 255 }),
});

// TicketType table
export const ticketTypes = pgTable('ticket_types', {
  id: serial('id').primaryKey(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('thb'),
  basePriceMinor: integer('base_price_minor').notNull(), // Price in satang (smallest currency unit)
  totalInventory: integer('total_inventory'), // null means unlimited
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// TicketOrder table
export const ticketOrders = pgTable('ticket_orders', {
  id: serial('id').primaryKey(),
  stripeCheckoutSessionId: varchar('stripe_checkout_session_id', { length: 255 }).notNull().unique(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }).unique(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  ticketTypeId: integer('ticket_type_id')
    .notNull()
    .references(() => ticketTypes.id),
  quantity: integer('quantity').notNull(),
  status: orderStatusEnum('status').notNull().default('PENDING'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    sessionIdx: uniqueIndex('session_idx').on(table.stripeCheckoutSessionId),
  };
});

// Individual Tickets table
export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => ticketOrders.id),
  ticketNumber: bigint('ticket_number', { mode: 'number' }).notNull().unique(),
  assignedFactionId: integer('assigned_faction_id')
    .notNull()
    .references(() => factions.id),
  verificationToken: varchar('verification_token', { length: 255 }).notNull().unique(),
  isVerified: boolean('is_verified').notNull().default(false),
  verifiedAt: timestamp('verified_at'),
  purchaseMethod: varchar('purchase_method', { length: 20 }).notNull().default('online'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    ticketNumberIdx: uniqueIndex('ticket_number_idx').on(table.ticketNumber),
    verificationTokenIdx: uniqueIndex('verification_token_idx').on(table.verificationToken),
  };
});

// TicketCounter table (for sequential ticket numbers)
export const ticketCounter = pgTable('ticket_counter', {
  id: integer('id').primaryKey().default(1),
  currentValue: bigint('current_value', { mode: 'number' }).notNull().default(0),
});

// Physical Tickets table (for in-person purchases with QR codes)
export const physicalTickets = pgTable('physical_tickets', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  ticketTypeId: integer('ticket_type_id')
    .notNull()
    .references(() => ticketTypes.id),
  isRedeemed: boolean('is_redeemed').notNull().default(false),
  redeemedAt: timestamp('redeemed_at'),
  orderId: integer('order_id').references(() => ticketOrders.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    codeIdx: uniqueIndex('physical_ticket_code_idx').on(table.code),
  };
});

// Type exports for TypeScript
export type Faction = typeof factions.$inferSelect;
export type NewFaction = typeof factions.$inferInsert;

export type TicketType = typeof ticketTypes.$inferSelect;
export type NewTicketType = typeof ticketTypes.$inferInsert;

export type TicketOrder = typeof ticketOrders.$inferSelect;
export type NewTicketOrder = typeof ticketOrders.$inferInsert;

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;

export type TicketCounter = typeof ticketCounter.$inferSelect;
export type NewTicketCounter = typeof ticketCounter.$inferInsert;

export type PhysicalTicket = typeof physicalTickets.$inferSelect;
export type NewPhysicalTicket = typeof physicalTickets.$inferInsert;
