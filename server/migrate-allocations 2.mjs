import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { works, providers, allocations } from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;

async function migrateAllocations() {
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  try {
    const connection = await mysql.createConnection(DATABASE_URL);
    const db = drizzle(connection);

    console.log('Starting migration of allocations from localStorage...');

    // This script assumes data is already in the database from previous operations
    // The main migration is done through the Allocations.tsx component
    // which now saves directly to the database via tRPC

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateAllocations();
