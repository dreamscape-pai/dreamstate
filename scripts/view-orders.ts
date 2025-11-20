import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { ticketOrders, factions, ticketTypes, tickets } from '../lib/db/schema';
import { eq, desc } from 'drizzle-orm';

dotenv.config();

async function viewOrders() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log('📊 Dreamstate Orders Report\n');

  // Get all orders with ticket details
  const orders = await db
    .select({
      order: ticketOrders,
      ticketType: ticketTypes,
    })
    .from(ticketOrders)
    .innerJoin(ticketTypes, eq(ticketOrders.ticketTypeId, ticketTypes.id))
    .orderBy(desc(ticketOrders.createdAt));

  if (orders.length === 0) {
    console.log('No orders yet.');
    process.exit(0);
  }

  console.log(`Total Orders: ${orders.length}`);

  // Get all tickets with factions
  const allTickets = await db
    .select({
      ticket: tickets,
      faction: factions,
    })
    .from(tickets)
    .innerJoin(factions, eq(tickets.assignedFactionId, factions.id));

  console.log(`Total Tickets: ${allTickets.length}\n`);

  // Summary by faction
  const factionCounts: Record<string, number> = {};
  allTickets.forEach(({ faction }) => {
    factionCounts[faction.displayName] = (factionCounts[faction.displayName] || 0) + 1;
  });

  console.log('Faction Distribution (by ticket):');
  Object.entries(factionCounts).forEach(([name, count]) => {
    console.log(`  ${name}: ${count}`);
  });
  console.log('');

  // Summary by status
  const statusCounts: Record<string, number> = {};
  orders.forEach(({ order }) => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
  });

  console.log('Order Status:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
  console.log('');

  // Recent orders
  console.log('Recent Orders (last 10):');
  console.log('─'.repeat(100));
  console.log(
    'Email'.padEnd(30) +
    'Ticket Type'.padEnd(25) +
    'Qty'.padEnd(5) +
    'Status'.padEnd(10) +
    'Date'
  );
  console.log('─'.repeat(100));

  orders.slice(0, 10).forEach(({ order, ticketType }) => {
    console.log(
      order.customerEmail.padEnd(30) +
      ticketType.name.substring(0, 24).padEnd(25) +
      `${order.quantity}`.padEnd(5) +
      order.status.padEnd(10) +
      order.createdAt.toISOString().substring(0, 16)
    );
  });

  console.log('─'.repeat(100));

  // Total revenue
  const totalRevenue = orders
    .filter(({ order }) => order.status === 'PAID')
    .reduce((sum, { order, ticketType }) => {
      return sum + (ticketType.basePriceMinor * order.quantity);
    }, 0);

  const currency = orders[0]?.ticketType.currency.toUpperCase() || 'THB';
  console.log(`\nTotal Revenue (PAID): ${(totalRevenue / 100).toFixed(2)} ${currency}`);

  process.exit(0);
}

viewOrders().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
