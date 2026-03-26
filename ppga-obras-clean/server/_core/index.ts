import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { runMigrations } from "../migrations";

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
  
  // Migrations are now manual - run via endpoint or CLI script
  // See /api/migrate-once endpoint or pnpm migrate command
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Temporary migration endpoint - execute once then remove
  app.get('/api/migrate-once', async (req, res) => {
    try {
      console.log('[Migrate-Once] Starting database migrations...');
      await runMigrations();
      console.log('[Migrate-Once] Migrations completed successfully');
      res.json({ 
        success: true, 
        message: 'Migrations executed successfully',
        info: 'IMPORTANT: Remove this endpoint from code after first execution',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('[Migrate-Once] Error:', error.message);
      res.status(500).json({ 
        success: false, 
        message: error.message
      });
    }
  });
  
  // Legacy setup-db endpoint (deprecated)
  app.get('/api/setup-db', (req, res) => {
    res.json({ 
      success: false, 
      message: 'This endpoint is deprecated. Use /api/migrate-once instead.'
    });
  });
  
  // Old migrations code (commented out - no longer needed)
  /*
  const migrations = [
        // Migration 0: Create users table
        `CREATE TABLE IF NOT EXISTS \`users\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`openId\` varchar(64) NOT NULL,
          \`name\` text,
          \`email\` varchar(320),
          \`loginMethod\` varchar(64),
          \`role\` enum('user','admin') NOT NULL DEFAULT 'user',
          \`createdAt\` timestamp NOT NULL DEFAULT (now()),
          \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
          \`lastSignedIn\` timestamp NOT NULL DEFAULT (now()),
          CONSTRAINT \`users_id\` PRIMARY KEY(\`id\`),
          CONSTRAINT \`users_openId_unique\` UNIQUE(\`openId\`)
        )`,
        // Migration 1: Create providers table (required before allocations)
        `CREATE TABLE IF NOT EXISTS \`providers\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`fullName\` varchar(255) NOT NULL,
          \`category\` varchar(100),
          \`observation\` text,
          \`remuneration\` varchar(100),
          \`baseValue\` varchar(100),
          \`createdAt\` timestamp NOT NULL DEFAULT (now()),
          \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT \`providers_id\` PRIMARY KEY(\`id\`)
        )`,
        // Migration 2: Create works table (required before allocations)
        `CREATE TABLE IF NOT EXISTS \`works\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`workName\` varchar(255) NOT NULL,
          \`architectName\` varchar(255),
          \`responsible\` varchar(255),
          \`status\` varchar(50) NOT NULL DEFAULT 'active',
          \`createdAt\` timestamp NOT NULL DEFAULT (now()),
          \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT \`works_id\` PRIMARY KEY(\`id\`)
        )`,
        // Migration 3: Create allocations table (after works and providers)
        `CREATE TABLE IF NOT EXISTS \`allocations\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`workId\` int NOT NULL,
          \`providerId\` int NOT NULL,
          \`providerName\` varchar(255) NOT NULL,
          \`service\` text,
          \`startDay\` int,
          \`endDay\` int,
          \`week\` int,
          \`year\` int,
          \`startDate\` varchar(20),
          \`endDate\` varchar(20),
          \`category\` varchar(100),
          \`observation\` text,
          \`remuneration\` varchar(100),
          \`baseValue\` varchar(100),
          \`createdAt\` timestamp NOT NULL DEFAULT (now()),
          \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT \`allocations_id\` PRIMARY KEY(\`id\`),
          CONSTRAINT \`allocations_workId_fk\` FOREIGN KEY(\`workId\`) REFERENCES \`works\`(\`id\`) ON DELETE CASCADE,
          CONSTRAINT \`allocations_providerId_fk\` FOREIGN KEY(\`providerId\`) REFERENCES \`providers\`(\`id\`) ON DELETE CASCADE
        )`,
        // Migration 4: Create architects table
        `CREATE TABLE IF NOT EXISTS \`architects\` (
          \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
          \`name\` varchar(255),
          \`officeNameName\` varchar(255),
          \`status\` varchar(50) DEFAULT 'active',
          \`address\` text,
          \`architectName\` varchar(255),
          \`phone\` varchar(20),
          \`birthDate\` varchar(10),
          \`commission\` varchar(100),
          \`observation\` text,
          \`reminder\` int,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,

        // Migration 3: Create clients table
        `CREATE TABLE IF NOT EXISTS \`clients\` (
          \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
          \`fullName\` varchar(255) NOT NULL,
          \`status\` varchar(50) NOT NULL DEFAULT 'prospect',
          \`phone\` varchar(20),
          \`birthDate\` varchar(20),
          \`address\` text,
          \`origin\` varchar(100),
          \`contact\` varchar(255),
          \`responsible\` varchar(255),
          \`commission\` varchar(50),
          \`workName\` varchar(255),
          \`workValue\` varchar(100),
          \`startDate\` varchar(20),
          \`endDate\` varchar(20),
          \`workStatus\` varchar(50),
          \`architectId\` int,
          \`architectName\` varchar(255),
          \`reminder\` int DEFAULT 0,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
      ];
  */
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
