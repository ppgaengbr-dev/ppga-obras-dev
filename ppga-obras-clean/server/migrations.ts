import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import mysql from "mysql2/promise";

/**
 * Parse DATABASE_URL to extract connection parameters
 * Format: mysql://user:password@host:port/database
 */
function parseDatabaseUrl(url: string) {
  const match = url.match(
    /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
  );
  if (!match) {
    throw new Error(`Invalid DATABASE_URL format: ${url}`);
  }
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
  };
}

/**
 * Run all pending migrations from drizzle/migrations folder
 * Tracks executed migrations in a migrations_log table
 */
export async function runMigrations() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error("[Migrations] DATABASE_URL not set");
      return false;
    }

    console.log("[Migrations] Starting migration process...");

    // Parse DATABASE_URL
    const config = parseDatabaseUrl(databaseUrl);

    // Create connection
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
    });

    console.log(`[Migrations] Connected to ${config.host}:${config.port}/${config.database}`);

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
