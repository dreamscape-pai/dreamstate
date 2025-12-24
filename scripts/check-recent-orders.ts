import 'dotenv/config';
import { db } from '../lib/db';
import { ticketOrders } from '../lib/db/schema';
import { desc } from 'drizzle-orm';

async function checkOrders() {
  try {
    const orders = await db
      .select()
      .from(ticketOrders)
      .orderBy(desc(ticketOrders.createdAt))
      .limit(5);

    console.log('\n📋 Recent orders:\n');
    if (orders.length === 0) {
      console.log('No orders found.');
    } else {
      orders.forEach(o => {
        console.log(`  Order ID: ${o.id}`);
        console.log(`  Status: ${o.status}`);
        console.log(`  Session: ${o.stripeCheckoutSessionId?.substring(0, 40)}...`);
        console.log(`  Created: ${o.createdAt}`);
        console.log();
      });
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOrders();
