import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getDb } from "./db";

/**
 * Run all pending migrations from drizzle/migrations folder
 * Tracks executed migrations in a migrations_log table
 */
export async function runMigrations() {
  const db = await getDb();
  if (!db) {
    console.error("[Migrations] Database not available");
    return false;
  }

  try {
    console.log("[Migrations] Starting migration process...");

    // Create migrations_log table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS migrations_log (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of migration files
    const migrationsDir = join(process.cwd(), "drizzle", "migrations");
    const migrationFiles = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    console.log(`[Migrations] Found ${migrationFiles.length} migration files`);

    // Execute each migration
    for (const file of migrationFiles) {
      try {
        // Check if migration already executed
        const result = await db.execute(
          `SELECT id FROM migrations_log WHERE name = ?`,
          [file]
        );

        if (result && Array.isArray(result) && result.length > 0) {
          console.log(`[Migrations] ✓ Already executed: ${file}`);
          continue;
        }

        // Read and execute migration
        const migrationPath = join(migrationsDir, file);
        const sql = readFileSync(migrationPath, "utf-8");

        console.log(`[Migrations] Executing: ${file}`);

        // Split by semicolon and execute each statement
        const statements = sql
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        for (const statement of statements) {
          await db.execute(statement);
        }

        // Log migration as executed
        await db.execute(`INSERT INTO migrations_log (name) VALUES (?)`, [file]);

        console.log(`[Migrations] ✓ Completed: ${file}`);
      } catch (error) {
        console.error(`[Migrations] ✗ Failed to execute ${file}:`, error);
        throw error;
      }
    }

    console.log("[Migrations] ✓ All migrations completed successfully");
    return true;
  } catch (error) {
    console.error("[Migrations] Fatal error:", error);
    throw error;
  }
}
