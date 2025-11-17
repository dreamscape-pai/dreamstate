import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { factions, ticketCounter } from '../lib/db/schema';

dotenv.config();

const seed = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log('⏳ Seeding database...');

  // Seed factions
  const factionData = [
    {
      name: 'DEJA_VU' as const,
      displayName: 'Déjà Vu',
      description: 'Experience the familiar strangeness of moments already lived. The Déjà Vu faction embraces the recurring patterns of dreams and reality.',
      colorToken: 'faction-deja-vu',
      iconUrl: '/images/factions/deja-vu.svg',
    },
    {
      name: 'LUCID' as const,
      displayName: 'Lucid',
      description: 'Masters of conscious dreaming, the Lucid faction walks the line between sleep and wakefulness with complete awareness.',
      colorToken: 'faction-lucid',
      iconUrl: '/images/factions/lucid.svg',
    },
    {
      name: 'HYPNOTIC' as const,
      displayName: 'Hypnotic',
      description: 'Surrender to the trance. The Hypnotic faction flows with the rhythm of the unconscious, embracing suggestion and flow states.',
      colorToken: 'faction-hypnotic',
      iconUrl: '/images/factions/hypnotic.svg',
    },
    {
      name: 'DRIFT' as const,
      displayName: 'Drift',
      description: 'Float between worlds. The Drift faction exists in the liminal spaces, neither here nor there, embracing the journey between states.',
      colorToken: 'faction-drift',
      iconUrl: '/images/factions/drift.svg',
    },
  ];

  await db.insert(factions).values(factionData).onConflictDoNothing();
  console.log('✅ Factions seeded');

  // Initialize ticket counter
  await db.insert(ticketCounter).values({ id: 1, currentValue: 0 }).onConflictDoNothing();
  console.log('✅ Ticket counter initialized');

  console.log('✅ Database seeded successfully');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed');
  console.error(err);
  process.exit(1);
});
