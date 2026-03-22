import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getDb } from "./db";
import mysql from "mysql2/promise";

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

    // Get raw connection for migrations
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "railway",
    });

    // Create migrations_log table if it doesn't exist
    await connection.execute(`
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
        const [rows] = await connection.execute(
          `SELECT id FROM migrations_log WHERE name = ?`,
          [file]
        );

        if (Array.isArray(rows) && rows.length > 0) {
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
          await connection.execute(statement);
        }

        // Log migration as executed
        await connection.execute(`INSERT INTO migrations_log (name) VALUES (?)`, [file]);

        console.log(`[Migrations] ✓ Completed: ${file}`);
      } catch (error) {
        console.error(`[Migrations] ✗ Failed to execute ${file}:`, error);
        await connection.end();
        throw error;
      }
    }

    await connection.end();
    console.log("[Migrations] ✓ All migrations completed successfully");
    return true;
  } catch (error) {
    console.error("[Migrations] Fatal error:", error);
    throw error;
  }
}
