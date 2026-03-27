-- Add authentication fields to users table
ALTER TABLE `users` 
ADD COLUMN `password` text AFTER `email`,
ADD COLUMN `status` enum('PENDING','APPROVED','BLOCKED') NOT NULL DEFAULT 'PENDING' AFTER `role`,
ADD COLUMN `linkedType` enum('CLIENTE','ARQUITETO','PRESTADOR') AFTER `status`,
ADD COLUMN `linkedId` int AFTER `linkedType`,
MODIFY COLUMN `openId` varchar(64) UNIQUE,
MODIFY COLUMN `email` varchar(320) UNIQUE,
MODIFY COLUMN `role` enum('ADMIN','CLIENTE','ARQUITETO','PRESTADOR') NOT NULL DEFAULT 'CLIENTE',
MODIFY COLUMN `lastSignedIn` timestamp NULL;

-- Create passwordRequests table
CREATE TABLE IF NOT EXISTS `passwordRequests` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `newPassword` text NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for authentication
CREATE INDEX idx_users_email ON `users`(`email`);
CREATE INDEX idx_users_status ON `users`(`status`);
CREATE INDEX idx_users_linkedType_linkedId ON `users`(`linkedType`, `linkedId`);
CREATE INDEX idx_passwordRequests_userId ON `passwordRequests`(`userId`);
CREATE INDEX idx_passwordRequests_status ON `passwordRequests`(`status`);
