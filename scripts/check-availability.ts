import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { ticketTypes, ticketOrders } from '../lib/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';

dotenv.config();

async function checkAvailability() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const sqlClient = neon(process.env.DATABASE_URL);
  const db = drizzle(sqlClient);

  console.log('🎫 Ticket Availability Report\n');

  const activeTicketTypes = await db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.isActive, true));

  if (activeTicketTypes.length === 0) {
    console.log('No active ticket types found.');
    console.log('\nTo add a ticket type, insert into the ticket_types table:');
    console.log(`
INSERT INTO ticket_types (
  stripe_price_id,
  name,
  description,
  currency,
  base_price_minor,
  total_inventory,
  is_active
) VALUES (
  'price_YOUR_STRIPE_PRICE_ID',
  'General Admission',
  'Full access to all experiences',
  'thb',
  150000,  -- 1500 THB
  500,     -- Total tickets
  true
);
    `);
    process.exit(0);
  }

  console.log('─'.repeat(100));
  console.log(
    'ID'.padEnd(5) +
    'Name'.padEnd(25) +
    'Price'.padEnd(12) +
    'Sold'.padEnd(10) +
    'Remaining'.padEnd(12) +
    'Total'.padEnd(10) +
    'Status'
  );
  console.log('─'.repeat(100));

  for (const ticket of activeTicketTypes) {
    const soldResult = await db
      .select({
        totalSold: sql<number>`COALESCE(SUM(${ticketOrders.quantity}), 0)`,
      })
      .from(ticketOrders)
      .where(
        and(
          eq(ticketOrders.ticketTypeId, ticket.id),
          inArray(ticketOrders.status, ['PAID', 'PENDING'])
        )
      );

    const sold = Number(soldResult[0]?.totalSold || 0);
    const remaining = ticket.totalInventory !== null ? ticket.totalInventory - sold : null;
    const price = (ticket.basePriceMinor / 100).toFixed(2);
    const currency = ticket.currency.toUpperCase();

    let status = 'Active';
    if (remaining !== null && remaining === 0) {
      status = '🔴 SOLD OUT';
    } else if (remaining !== null && remaining < 20) {
      status = '🟡 Low';
    } else {
      status = '🟢 Available';
    }

    console.log(
      `${ticket.id}`.padEnd(5) +
      ticket.name.substring(0, 24).padEnd(25) +
      `${price} ${currency}`.padEnd(12) +
      `${sold}`.padEnd(10) +
      (remaining !== null ? `${remaining}`.padEnd(12) : 'Unlimited'.padEnd(12)) +
      (ticket.totalInventory !== null ? `${ticket.totalInventory}`.padEnd(10) : '∞'.padEnd(10)) +
      status
    );
  }

  console.log('─'.repeat(100));

  // Show inactive ticket types if any
  const inactiveTickets = await db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.isActive, false));

  if (inactiveTickets.length > 0) {
    console.log(`\n⚠️  ${inactiveTickets.length} inactive ticket type(s) found`);
  }

  process.exit(0);
}

checkAvailability().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
