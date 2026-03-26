CREATE TABLE `allocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workId` int NOT NULL,
	`providerId` int NOT NULL,
	`providerName` varchar(255) NOT NULL,
	`service` text,
	`startDay` int NOT NULL,
	`endDay` int NOT NULL,
	`week` int NOT NULL,
	`year` int NOT NULL,
	`category` varchar(100),
	`observation` text,
	`remuneration` varchar(100),
	`baseValue` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `allocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `providers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`category` varchar(100),
	`observation` text,
	`remuneration` varchar(100),
	`baseValue` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `providers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `works` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workName` varchar(255) NOT NULL,
	`architectName` varchar(255),
	`responsible` varchar(255),
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `works_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `allocations` ADD CONSTRAINT `allocations_workId_works_id_fk` FOREIGN KEY (`workId`) REFERENCES `works`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `allocations` ADD CONSTRAINT `allocations_providerId_providers_id_fk` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE no action ON UPDATE no action;