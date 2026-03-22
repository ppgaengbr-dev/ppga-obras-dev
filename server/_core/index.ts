import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Setup database route - executes migrations using Drizzle
  app.get('/api/setup-db', async (req, res) => {
    try {
      const { getDb } = await import('../db');
      const db = await getDb();
      
      if (!db) {
        return res.status(500).json({ success: false, message: 'Database connection failed' });
      }
      
      console.log('[setup-db] Starting database migration...');
      
      // Execute migrations using raw SQL queries
      const migrations = [
        // DROP all tables first to start fresh
        `DROP TABLE IF EXISTS \`allocations\``,
        `DROP TABLE IF EXISTS \`providers\``,
        `DROP TABLE IF EXISTS \`architects\``,
        `DROP TABLE IF EXISTS \`works\``,
        `DROP TABLE IF EXISTS \`clients\``,
        `DROP TABLE IF EXISTS \`categories\``,
        `DROP TABLE IF EXISTS \`remunerations\``,
        `DROP TABLE IF EXISTS \`users\``,
        
        // Migration 0: Create users table
        `CREATE TABLE \`users\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`openId\` varchar(64) NOT NULL,
          \`name\` text,
          \`email\` varchar(320),
          \`loginMethod\` varchar(64),
          \`role\` enum('user','admin') NOT NULL DEFAULT 'user',
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          \`lastSignedIn\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT \`users_id\` PRIMARY KEY(\`id\`),
          CONSTRAINT \`users_openId_unique\` UNIQUE(\`openId\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        
        // Migration 1: Create categories table
        `CREATE TABLE \`categories\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`name\` varchar(100) NOT NULL,
          \`description\` text,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT \`categories_id\` PRIMARY KEY(\`id\`),
          CONSTRAINT \`categories_name_unique\` UNIQUE(\`name\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        
        // Migration 2: Create remunerations table
        `CREATE TABLE \`remunerations\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`name\` varchar(100) NOT NULL,
          \`description\` text,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT \`remunerations_id\` PRIMARY KEY(\`id\`),
          CONSTRAINT \`remunerations_name_unique\` UNIQUE(\`name\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        
        // Migration 3: Create architects table
        `CREATE TABLE \`architects\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`officeNameName\` varchar(255) NOT NULL,
          \`status\` varchar(50) NOT NULL DEFAULT 'active',
          \`address\` text,
          \`architectName\` varchar(255),
          \`phone\` varchar(20),
          \`birthDate\` date,
          \`commission\` varchar(100),
          \`observation\` text,
          \`reminder\` int DEFAULT 0,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT \`architects_id\` PRIMARY KEY(\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        
        // Migration 4: Create providers table
        `CREATE TABLE \`providers\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`fullName\` varchar(255) NOT NULL,
          \`status\` varchar(50) NOT NULL DEFAULT 'active',
          \`cpf\` varchar(20),
          \`birthDate\` date,
          \`address\` text,
          \`category\` varchar(100),
          \`observation\` text,
          \`remuneration\` varchar(100),
          \`baseValue\` decimal(10,2),
          \`uniformSize\` varchar(50),
          \`shoeSize\` varchar(50),
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT \`providers_id\` PRIMARY KEY(\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        
        // Migration 5: Create clients table
        `CREATE TABLE \`clients\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`fullName\` varchar(255) NOT NULL,
          \`status\` varchar(50) NOT NULL DEFAULT 'prospect',
          \`phone\` varchar(20),
          \`birthDate\` date,
          \`address\` text,
          \`origin\` varchar(100),
          \`contact\` varchar(255),
          \`responsible\` varchar(255),
          \`commission\` varchar(100),
          \`workName\` varchar(255),
          \`workValue\` decimal(10,2),
          \`startDate\` date,
          \`endDate\` date,
          \`workStatus\` varchar(50) DEFAULT 'waiting',
          \`reminder\` int DEFAULT 0,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT \`clients_id\` PRIMARY KEY(\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        
        // Migration 6: Create works table
        `CREATE TABLE \`works\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`workName\` varchar(255) NOT NULL,
          \`architectId\` int,
          \`architectName\` varchar(255),
          \`responsible\` varchar(255),
          \`status\` varchar(50) NOT NULL DEFAULT 'active',
          \`workValue\` decimal(10,2),
          \`startDate\` date,
          \`endDate\` date,
          \`commission\` varchar(100),
          \`clientPhone\` varchar(20),
          \`clientBirthDate\` date,
          \`clientAddress\` text,
          \`clientOrigin\` varchar(100),
          \`clientContact\` varchar(255),
          \`reminder\` int DEFAULT 0,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT \`works_id\` PRIMARY KEY(\`id\`),
          CONSTRAINT \`works_architectId_fk\` FOREIGN KEY(\`architectId\`) REFERENCES \`architects\`(\`id\`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        
        // Migration 7: Create allocations table
        `CREATE TABLE \`allocations\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`workId\` int NOT NULL,
          \`providerId\` int NOT NULL,
          \`providerName\` varchar(255) NOT NULL,
          \`service\` text,
          \`startDate\` date NOT NULL,
          \`endDate\` date NOT NULL,
          \`startDay\` int,
          \`endDay\` int,
          \`week\` int,
          \`year\` int,
          \`category\` varchar(100),
          \`observation\` text,
          \`remuneration\` varchar(100),
          \`baseValue\` decimal(10,2),
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT \`allocations_id\` PRIMARY KEY(\`id\`),
          CONSTRAINT \`allocations_workId_fk\` FOREIGN KEY(\`workId\`) REFERENCES \`works\`(\`id\`) ON DELETE CASCADE,
          CONSTRAINT \`allocations_providerId_fk\` FOREIGN KEY(\`providerId\`) REFERENCES \`providers\`(\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      ];
      
      // Execute each migration
      for (const migration of migrations) {
        try {
          await db.execute(migration);
          console.log('[setup-db] Executed migration:', migration.substring(0, 50) + '...');
        } catch (error: any) {
          // Ignore IF NOT EXISTS errors
          if (!error.message.includes('already exists')) {
            console.error('[setup-db] Migration error:', error.message);
            throw error;
          }
        }
      }
      
      console.log('[setup-db] Database migration completed successfully!');
      res.json({ success: true, message: 'Database synced successfully' });
    } catch (error: any) {
      console.error('[setup-db] Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
  
  // TRPC middleware
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app);
  }

  const port = await findAvailablePort();
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

startServer().catch(console.error);
