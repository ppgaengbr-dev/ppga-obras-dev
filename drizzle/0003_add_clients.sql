-- Create clients table
CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `fullName` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'prospect',
  `phone` varchar(20),
  `birthDate` varchar(20),
  `address` text,
  `origin` varchar(100),
  `contact` varchar(255),
  `responsible` varchar(255),
  `commission` varchar(50),
  `workName` varchar(255),
  `workValue` varchar(100),
  `startDate` varchar(20),
  `endDate` varchar(20),
  `reminder` int DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
