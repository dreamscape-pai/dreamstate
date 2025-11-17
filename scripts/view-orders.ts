import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { ticketOrders, factions, ticketTypes } from '../lib/db/schema';
import { eq, desc } from 'drizzle-orm';

dotenv.config();

async function viewOrders() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log('📊 Dreamstate Orders Report\n');

  // Get all orders with details
  const orders = await db
    .select({
      order: ticketOrders,
      faction: factions,
      ticketType: ticketTypes,
    })
    .from(ticketOrders)
    .innerJoin(factions, eq(ticketOrders.assignedFactionId, factions.id))
    .innerJoin(ticketTypes, eq(ticketOrders.ticketTypeId, ticketTypes.id))
    .orderBy(desc(ticketOrders.createdAt));

  if (orders.length === 0) {
    console.log('No orders yet.');
    process.exit(0);
  }

  console.log(`Total Orders: ${orders.length}\n`);

  // Summary by faction
  const factionCounts: Record<string, number> = {};
  orders.forEach(({ faction }) => {
    factionCounts[faction.displayName] = (factionCounts[faction.displayName] || 0) + 1;
  });

  console.log('Faction Distribution:');
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
  console.log('─'.repeat(120));
  console.log(
    'Seq#'.padEnd(6) +
    'Email'.padEnd(30) +
    'Ticket Type'.padEnd(20) +
    'Qty'.padEnd(5) +
    'Faction'.padEnd(15) +
    'Status'.padEnd(10) +
    'Date'
  );
  console.log('─'.repeat(120));

  orders.slice(0, 10).forEach(({ order, faction, ticketType }) => {
    console.log(
      `${order.orderSequenceNumber}`.padEnd(6) +
      order.customerEmail.padEnd(30) +
      ticketType.name.substring(0, 19).padEnd(20) +
      `${order.quantity}`.padEnd(5) +
      faction.displayName.padEnd(15) +
      order.status.padEnd(10) +
      order.createdAt.toISOString().substring(0, 16)
    );
  });

  console.log('─'.repeat(120));

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
