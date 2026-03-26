import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Architects table
export const architects = mysqlTable("architects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }),
  officeNameName: varchar("officeNameName", { length: 255 }),
  status: varchar("status", { length: 50 }).default("active"),
  address: text("address"),
  architectName: varchar("architectName", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  birthDate: varchar("birthDate", { length: 10 }),
  commission: varchar("commission", { length: 100 }),
  observation: text("observation"),
  reminder: int("reminder"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Architect = typeof architects.$inferSelect;
export type InsertArchitect = typeof architects.$inferInsert;

// Works table
export const works = mysqlTable("works", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }),
  workName: varchar("workName", { length: 255 }).notNull(),
  clientName: varchar("clientName", { length: 255 }),
  clientId: int("clientId"),
  architectId: int("architectId").references(() => architects.id),
  responsible: varchar("responsible", { length: 255 }),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  workValue: varchar("workValue", { length: 100 }),
  startDate: varchar("startDate", { length: 10 }),
  endDate: varchar("endDate", { length: 10 }),
  commission: varchar("commission", { length: 100 }),
  clientPhone: varchar("clientPhone", { length: 20 }),
  clientBirthDate: varchar("clientBirthDate", { length: 10 }),
  clientAddress: text("clientAddress"),
  clientOrigin: varchar("clientOrigin", { length: 100 }),
  clientContact: varchar("clientContact", { length: 255 }),
  reminder: int("reminder"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Work = typeof works.$inferSelect;
export type InsertWork = typeof works.$inferInsert;

// Providers table
export const providers = mysqlTable("providers", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("active"),
  cpf: varchar("cpf", { length: 20 }),
  birthDate: varchar("birthDate", { length: 10 }),
  address: text("address"),
  category: varchar("category", { length: 100 }),
  observation: text("observation"),
  remuneration: varchar("remuneration", { length: 100 }),
  baseValue: varchar("baseValue", { length: 100 }),
  uniformSize: varchar("uniformSize", { length: 50 }),
  shoeSize: varchar("shoeSize", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Provider = typeof providers.$inferSelect;
export type InsertProvider = typeof providers.$inferInsert;

// Allocations table
export const allocations = mysqlTable("allocations", {
  id: int("id").autoincrement().primaryKey(),
  workId: int("workId").notNull().references(() => works.id, { onDelete: 'cascade' }),
  providerId: int("providerId").notNull().references(() => providers.id, { onDelete: 'cascade' }),
  providerName: varchar("providerName", { length: 255 }).notNull(),
  service: text("service"),
  startDate: varchar("startDate", { length: 10 }).notNull(),
  endDate: varchar("endDate", { length: 10 }).notNull(),
  startDay: int("startDay"),
  endDay: int("endDay"),
  week: int("week"),
  year: int("year"),
  category: varchar("category", { length: 100 }),
  observation: text("observation"),
  remuneration: varchar("remuneration", { length: 100 }),
  baseValue: varchar("baseValue", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Allocation = typeof allocations.$inferSelect;
export type InsertAllocation = typeof allocations.$inferInsert;

// Clients table
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("prospect").notNull(),
  phone: varchar("phone", { length: 20 }),
  birthDate: varchar("birthDate", { length: 10 }),
  address: text("address"),
  origin: varchar("origin", { length: 100 }),
  contact: varchar("contact", { length: 255 }),
  responsible: varchar("responsible", { length: 255 }),
  commission: varchar("commission", { length: 100 }),
  workName: varchar("workName", { length: 255 }),
  workValue: varchar("workValue", { length: 100 }),
  startDate: varchar("startDate", { length: 10 }),
  endDate: varchar("endDate", { length: 10 }),
  workStatus: varchar("workStatus", { length: 50 }).default("waiting"),
  reminder: int("reminder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// Categories table
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// Remunerations table
export const remunerations = mysqlTable("remunerations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Remuneration = typeof remunerations.$inferSelect;
export type InsertRemuneration = typeof remunerations.$inferInsert;