import 'dotenv/config';
import { db } from '../lib/db';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    const migrationSQL = fs.readFileSync(
      path.join(process.cwd(), 'drizzle/0004_nice_goliath.sql'),
      'utf-8'
    );

    console.log('Running migration 0004...');
    await db.execute(sql.raw(migrationSQL));
    console.log('✅ Migration 0004 completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
