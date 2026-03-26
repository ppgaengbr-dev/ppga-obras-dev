-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `openId` varchar(64) NOT NULL UNIQUE,
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create architects table
CREATE TABLE IF NOT EXISTS `architects` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255),
  `officeNameName` varchar(255),
  `status` varchar(50) DEFAULT 'active',
  `address` text,
  `architectName` varchar(255),
  `phone` varchar(20),
  `birthDate` varchar(10),
  `commission` varchar(100),
  `observation` text,
  `reminder` int,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create categories table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(100) NOT NULL UNIQUE,
  `description` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create remunerations table
CREATE TABLE IF NOT EXISTS `remunerations` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(100) NOT NULL UNIQUE,
  `description` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create providers table
CREATE TABLE IF NOT EXISTS `providers` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `fullName` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT 'active',
  `cpf` varchar(20),
  `birthDate` varchar(10),
  `address` text,
  `category` varchar(100),
  `observation` text,
  `remuneration` varchar(100),
  `baseValue` varchar(100),
  `uniformSize` varchar(50),
  `shoeSize` varchar(50),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create clients table
CREATE TABLE IF NOT EXISTS `clients` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `fullName` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'prospect',
  `phone` varchar(20),
  `birthDate` varchar(10),
  `address` text,
  `origin` varchar(100),
  `contact` varchar(255),
  `responsible` varchar(255),
  `commission` varchar(100),
  `workName` varchar(255),
  `workValue` varchar(100),
  `startDate` varchar(10),
  `endDate` varchar(10),
  `workStatus` varchar(50) DEFAULT 'waiting',
  `reminder` int DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create works table
CREATE TABLE IF NOT EXISTS `works` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255),
  `workName` varchar(255) NOT NULL,
  `clientName` varchar(255),
  `clientId` int,
  `architectId` int,
  `responsible` varchar(255),
  `status` varchar(50) NOT NULL DEFAULT 'active',
  `workValue` varchar(100),
  `startDate` varchar(10),
  `endDate` varchar(10),
  `commission` varchar(100),
  `clientPhone` varchar(20),
  `clientBirthDate` varchar(10),
  `clientAddress` text,
  `clientOrigin` varchar(100),
  `clientContact` varchar(255),
  `reminder` int,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`architectId`) REFERENCES `architects`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create allocations table
CREATE TABLE IF NOT EXISTS `allocations` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `workId` int NOT NULL,
  `providerId` int NOT NULL,
  `providerName` varchar(255) NOT NULL,
  `service` text,
  `startDate` varchar(10) NOT NULL,
  `endDate` varchar(10) NOT NULL,
  `startDay` int,
  `endDay` int,
  `week` int,
  `year` int,
  `category` varchar(100),
  `observation` text,
  `remuneration` varchar(100),
  `baseValue` varchar(100),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`workId`) REFERENCES `works`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX idx_users_openId ON `users`(`openId`);
CREATE INDEX idx_architects_status ON `architects`(`status`);
CREATE INDEX idx_providers_status ON `providers`(`status`);
CREATE INDEX idx_clients_status ON `clients`(`status`);
CREATE INDEX idx_works_status ON `works`(`status`);
CREATE INDEX idx_works_architectId ON `works`(`architectId`);
CREATE INDEX idx_allocations_workId ON `allocations`(`workId`);
CREATE INDEX idx_allocations_providerId ON `allocations`(`providerId`);
