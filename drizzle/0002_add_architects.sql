-- Create architects table
CREATE TABLE `architects` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add architectId column to works table
ALTER TABLE `works` ADD COLUMN `architectId` int;

-- Add foreign key constraint
ALTER TABLE `works` ADD CONSTRAINT `works_architectId_architects_id_fk` FOREIGN KEY (`architectId`) REFERENCES `architects` (`id`);

-- Migrate existing architectName data to architects table (if needed)
-- This will be done manually or via a separate script if necessary
