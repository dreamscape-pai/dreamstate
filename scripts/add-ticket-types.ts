import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { ticketTypes } from '../lib/db/schema';

dotenv.config();

const addTicketTypes = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log('⏳ Adding ticket types...');

  // IMPORTANT: You need to create these products in Stripe first!
  // Go to https://dashboard.stripe.com/test/products
  // Create products and copy the Price IDs here

  const ticketTypeData = [
    {
      stripePriceId: 'price_1SU9uARqZ4vIrmRF79llCcC9', // First Mover (Super Early Bird) - 900 THB
      name: 'First Mover',
      description: 'Limited first mover pricing - 30 tickets only!',
      currency: 'thb',
      basePriceMinor: 90000, // 900 THB in satang (900 * 100)
      totalInventory: 30,
      isActive: true,
    },
    {
      stripePriceId: 'price_1SUCm1RqZ4vIrmRFXTIifbAW', // Early Bird - 1200 THB
      name: 'Early Bird',
      description: 'Early bird pricing - 30 tickets only!',
      currency: 'thb',
      basePriceMinor: 120000, // 1200 THB in satang
      totalInventory: 30,
      isActive: true,
    },
    {
      stripePriceId: 'price_1SUCn9RqZ4vIrmRFRBMjcWOZ', // General Admission - 1500 THB
      name: 'General Admission',
      description: 'Standard entry to Dreamstate',
      currency: 'thb',
      basePriceMinor: 150000, // 1500 THB in satang
      totalInventory: 240,
      isActive: true,
    },
    {
      stripePriceId: 'price_1SUCq4RqZ4vIrmRFQM951lNt', // Donor - 2000 THB
      name: 'Donor Ticket',
      description: 'Support Dreamstate with a donor ticket - includes all general admission benefits plus exclusive donor perks',
      currency: 'thb',
      basePriceMinor: 200000, // 2000 THB in satang
      totalInventory: null, // Unlimited
      isActive: true,
    },
  ];

  await db.insert(ticketTypes).values(ticketTypeData);
  console.log('✅ Ticket types added successfully');

  console.log('\n📋 Summary - All tickets added:');
  console.log('✅ First Mover: 900 THB (30 tickets)');
  console.log('✅ Early Bird: 1,200 THB (30 tickets)');
  console.log('✅ General Admission: 1,500 THB (240 tickets)');
  console.log('✅ Donor Ticket: 2,000 THB (unlimited)');

  process.exit(0);
};

addTicketTypes().catch((err) => {
  console.error('❌ Failed to add ticket types');
  console.error(err);
  process.exit(1);
});
