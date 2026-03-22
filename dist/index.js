var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  allocations: () => allocations,
  architects: () => architects,
  categories: () => categories,
  clients: () => clients,
  providers: () => providers,
  remunerations: () => remunerations,
  users: () => users,
  works: () => works
});
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users, architects, works, providers, allocations, clients, categories, remunerations;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
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
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    architects = mysqlTable("architects", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    works = mysqlTable("works", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    providers = mysqlTable("providers", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    allocations = mysqlTable("allocations", {
      id: int("id").autoincrement().primaryKey(),
      workId: int("workId").notNull().references(() => works.id, { onDelete: "cascade" }),
      providerId: int("providerId").notNull().references(() => providers.id, { onDelete: "cascade" }),
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    clients = mysqlTable("clients", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    categories = mysqlTable("categories", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 100 }).notNull().unique(),
      description: text("description"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    remunerations = mysqlTable("remunerations", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 100 }).notNull().unique(),
      description: text("description"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  createAllocation: () => createAllocation,
  createArchitect: () => createArchitect,
  createCategory: () => createCategory,
  createClient: () => createClient,
  createProvider: () => createProvider,
  createRemuneration: () => createRemuneration,
  createWork: () => createWork,
  deleteAllocation: () => deleteAllocation,
  deleteArchitect: () => deleteArchitect,
  deleteCategory: () => deleteCategory,
  deleteClient: () => deleteClient,
  deleteProvider: () => deleteProvider,
  deleteRemuneration: () => deleteRemuneration,
  deleteWork: () => deleteWork,
  getAllAllocations: () => getAllAllocations,
  getAllArchitects: () => getAllArchitects,
  getAllCategories: () => getAllCategories,
  getAllClients: () => getAllClients,
  getAllProviders: () => getAllProviders,
  getAllRemunerations: () => getAllRemunerations,
  getAllWorks: () => getAllWorks,
  getAllocationsWithDetails: () => getAllocationsWithDetails,
  getDb: () => getDb,
  getUserByOpenId: () => getUserByOpenId,
  getWorksWithArchitects: () => getWorksWithArchitects,
  updateAllocation: () => updateAllocation,
  updateArchitect: () => updateArchitect,
  updateCategory: () => updateCategory,
  updateClient: () => updateClient,
  updateProvider: () => updateProvider,
  updateRemuneration: () => updateRemuneration,
  updateWork: () => updateWork,
  upsertUser: () => upsertUser
});
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllWorks() {
  const db = await getDb();
  if (!db) return [];
  try {
    const { clients: clientsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    const clientWorks = await db.select().from(clientsTable).where(
      eq2(clientsTable.status, "work")
    );
    const works2 = clientWorks.map((client) => ({
      id: client.id,
      name: client.fullName,
      workName: client.workName || client.fullName,
      clientName: client.fullName,
      clientId: client.id,
      status: client.workStatus || "waiting",
      workValue: client.workValue || 0,
      startDate: client.startDate,
      endDate: client.endDate,
      responsible: client.responsible,
      clientPhone: client.phone,
      clientBirthDate: client.birthDate,
      clientAddress: client.address,
      clientOrigin: client.origin,
      clientContact: client.contact,
      commission: client.commission,
      reminder: client.reminder,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    }));
    return works2;
  } catch (error) {
    console.error("[Database] Failed to get works:", error);
    return [];
  }
}
async function getAllProviders() {
  const db = await getDb();
  if (!db) return [];
  try {
    const { providers: providersTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    return await db.select().from(providersTable);
  } catch (error) {
    console.error("[Database] Failed to get providers:", error);
    return [];
  }
}
async function getAllAllocations() {
  const db = await getDb();
  if (!db) return [];
  try {
    const { allocations: allocationsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const allocations2 = await db.select().from(allocationsTable);
    return allocations2.map((a) => ({
      ...a,
      workId: Number(a.workId),
      providerId: Number(a.providerId)
    }));
  } catch (error) {
    console.error("[Database] Failed to get allocations:", error);
    return [];
  }
}
async function createAllocation(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { allocations: allocationsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    console.log("[Database] createAllocation input:", data);
    const startDate = String(data.startDate).trim();
    const endDate = String(data.endDate).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      throw new Error("Invalid startDate format. Expected YYYY-MM-DD");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      throw new Error("Invalid endDate format. Expected YYYY-MM-DD");
    }
    const allocationData = {
      workId: data.workId,
      providerId: data.providerId,
      providerName: data.providerName || "",
      service: data.service || "",
      startDate,
      endDate,
      category: data.category || "",
      observation: data.observation || "",
      remuneration: data.remuneration || "",
      baseValue: data.baseValue || ""
      // week, year, startDay, endDay sao ignorados - nao sao mais necessarios
    };
    console.log("[Database] allocationData to insert:", allocationData);
    const result = await db.insert(allocationsTable).values(allocationData);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create allocation:", error);
    throw error;
  }
}
async function updateAllocation(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { allocations: allocationsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    console.log("[Database] updateAllocation input:", data);
    const startDate = String(data.startDate).trim();
    const endDate = String(data.endDate).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      throw new Error("Invalid startDate format. Expected YYYY-MM-DD");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      throw new Error("Invalid endDate format. Expected YYYY-MM-DD");
    }
    const allocationData = {
      workId: data.workId,
      providerId: data.providerId,
      providerName: data.providerName || "",
      service: data.service || "",
      startDate,
      endDate,
      category: data.category || "",
      observation: data.observation || "",
      remuneration: data.remuneration || "",
      baseValue: data.baseValue || ""
    };
    console.log("[Database] allocationData to update:", allocationData);
    const result = await db.update(allocationsTable).set(allocationData).where(eq(allocationsTable.id, data.id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update allocation:", error);
    throw error;
  }
}
async function deleteAllocation(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { allocations: allocationsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.delete(allocationsTable).where(eq(allocationsTable.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete allocation:", error);
    throw error;
  }
}
async function getAllArchitects() {
  const db = await getDb();
  if (!db) return [];
  try {
    const { architects: architectsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    return await db.select().from(architectsTable);
  } catch (error) {
    console.error("[Database] Failed to get architects:", error);
    return [];
  }
}
async function getWorksWithArchitects() {
  const db = await getDb();
  if (!db) return [];
  try {
    const { clients: clientsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq2 } = await import("drizzle-orm");
    const clientWorks = await db.select().from(clientsTable).where(
      eq2(clientsTable.status, "work")
    );
    return clientWorks.map((client) => ({
      id: client.id,
      name: client.fullName,
      workName: client.workName || client.fullName,
      clientName: client.fullName,
      clientId: client.id,
      status: client.workStatus || "waiting",
      workValue: client.workValue || 0,
      startDate: client.startDate,
      endDate: client.endDate,
      responsible: client.responsible,
      architectName: client.architectName || "",
      architectId: client.architectId,
      clientOrigin: client.origin || "",
      clientContact: client.contact || "",
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    }));
  } catch (error) {
    console.error("[Database] Failed to get works with architects:", error);
    return [];
  }
}
async function getAllocationsWithDetails() {
  const db = await getDb();
  if (!db) return [];
  try {
    const { allocations: allocationsTable, works: worksTable, providers: providersTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    return await db.select().from(allocationsTable);
  } catch (error) {
    console.error("[Database] Failed to get allocations with details:", error);
    return [];
  }
}
async function getAllClients() {
  const db = await getDb();
  if (!db) return [];
  try {
    const { clients: clientsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    return await db.select().from(clientsTable);
  } catch (error) {
    console.error("[Database] Failed to get clients:", error);
    return [];
  }
}
async function createClient(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { clients: clientsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const result = await db.insert(clientsTable).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create client:", error);
    throw error;
  }
}
async function updateClient(id, data) {
  console.log("[DB] updateClient called with:", { id, data });
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { clients: clientsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const validFields = {
      fullName: data.fullName,
      status: data.status,
      phone: data.phone,
      birthDate: data.birthDate,
      address: data.address,
      origin: data.origin,
      contact: data.contact,
      responsible: data.responsible,
      commission: data.commission,
      workName: data.workName,
      workValue: data.workValue,
      startDate: data.startDate,
      endDate: data.endDate,
      workStatus: data.workStatus,
      reminder: data.reminder ? parseInt(data.reminder) : 0
    };
    Object.keys(validFields).forEach((key) => validFields[key] === void 0 && delete validFields[key]);
    await db.update(clientsTable).set(validFields).where(eq(clientsTable.id, id));
  } catch (error) {
    console.error("[Database] Failed to update client:", error);
    throw error;
  }
}
async function deleteClient(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { clients: clientsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.delete(clientsTable).where(eq(clientsTable.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete client:", error);
    throw error;
  }
}
async function createWork(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { works: worksTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const result = await db.insert(worksTable).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create work:", error);
    throw error;
  }
}
async function updateWork(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { works: worksTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const validFields = ["name", "workName", "clientName", "clientId", "architectId", "responsible", "status", "workValue", "startDate", "endDate", "commission", "clientPhone", "clientBirthDate", "clientAddress", "clientOrigin", "clientContact", "reminder"];
    const filteredData = Object.keys(data).filter((key) => validFields.includes(key)).reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    }, {});
    console.log("[Database] Updating work with filtered data:", filteredData);
    await db.update(worksTable).set(filteredData).where(eq(worksTable.id, id));
  } catch (error) {
    console.error("[Database] Failed to update work:", error);
    throw error;
  }
}
async function deleteWork(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { clients: clientsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.delete(clientsTable).where(eq(clientsTable.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete work:", error);
    throw error;
  }
}
async function createProvider(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { providers: providersTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { id, ...dataWithoutId } = data;
    const result = await db.insert(providersTable).values(dataWithoutId);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create provider:", error);
    throw error;
  }
}
async function updateProvider(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { providers: providersTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.update(providersTable).set(data).where(eq(providersTable.id, id));
  } catch (error) {
    console.error("[Database] Failed to update provider:", error);
    throw error;
  }
}
async function deleteProvider(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { providers: providersTable, allocations: allocationsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.delete(allocationsTable).where(eq(allocationsTable.providerId, id));
    await db.delete(providersTable).where(eq(providersTable.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete provider:", error);
    throw error;
  }
}
async function createArchitect(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { architects: architectsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { id, ...dataWithoutId } = data;
    const cleanData = {
      ...dataWithoutId,
      name: dataWithoutId.name || dataWithoutId.officeNameName || "Unnamed"
    };
    const result = await db.insert(architectsTable).values(cleanData);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create architect:", error);
    throw error;
  }
}
async function updateArchitect(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { architects: architectsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.update(architectsTable).set(data).where(eq(architectsTable.id, id));
  } catch (error) {
    console.error("[Database] Failed to update architect:", error);
    throw error;
  }
}
async function deleteArchitect(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { architects: architectsTable, works: worksTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.update(worksTable).set({ architectId: null }).where(eq(worksTable.architectId, id));
    await db.delete(architectsTable).where(eq(architectsTable.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete architect:", error);
    throw error;
  }
}
async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  try {
    const { categories: categoriesTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    return await db.select().from(categoriesTable);
  } catch (error) {
    console.error("[Database] Failed to get categories:", error);
    return [];
  }
}
async function createCategory(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { categories: categoriesTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const result = await db.insert(categoriesTable).values({
      name: data.name,
      description: data.description || ""
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create category:", error);
    throw error;
  }
}
async function updateCategory(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { categories: categoriesTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.update(categoriesTable).set(data).where(eq(categoriesTable.id, id));
  } catch (error) {
    console.error("[Database] Failed to update category:", error);
    throw error;
  }
}
async function deleteCategory(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { categories: categoriesTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete category:", error);
    throw error;
  }
}
async function getAllRemunerations() {
  const db = await getDb();
  if (!db) return [];
  try {
    const { remunerations: remunerationsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    return await db.select().from(remunerationsTable);
  } catch (error) {
    console.error("[Database] Failed to get remunerations:", error);
    return [];
  }
}
async function createRemuneration(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { remunerations: remunerationsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const result = await db.insert(remunerationsTable).values({
      name: data.name,
      description: data.description || ""
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create remuneration:", error);
    throw error;
  }
}
async function updateRemuneration(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { remunerations: remunerationsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.update(remunerationsTable).set(data).where(eq(remunerationsTable.id, id));
  } catch (error) {
    console.error("[Database] Failed to update remuneration:", error);
    throw error;
  }
}
async function deleteRemuneration(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { remunerations: remunerationsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.delete(remunerationsTable).where(eq(remunerationsTable.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete remuneration:", error);
    throw error;
  }
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    _db = null;
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/oauth.ts
init_db();

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
init_db();
init_env();
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  clients: router({
    list: publicProcedure.query(async () => {
      const { getAllClients: getAllClients2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getAllClients2();
    }),
    create: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { createClient: createClient2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return createClient2(input);
    }),
    update: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      try {
        console.log("[clients.update] Input:", JSON.stringify(input));
        const { updateClient: updateClient2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { id, ...data } = input;
        console.log("[clients.update] ID:", id, "Data:", JSON.stringify(data));
        await updateClient2(id, data);
        console.log("[clients.update] Success");
        return input;
      } catch (error) {
        console.error("[clients.update] Error:", error.message);
        throw error;
      }
    }),
    delete: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { deleteClient: deleteClient2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await deleteClient2(input.id);
      return { success: true };
    })
  }),
  works: router({
    list: publicProcedure.query(async () => {
      const { getAllWorks: getAllWorks2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getAllWorks2();
    }),
    create: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { createWork: createWork2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return createWork2(input);
    }),
    update: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { updateWork: updateWork2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await updateWork2(input.id, input);
      return input;
    }),
    delete: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      console.log("[works.delete] Input:", JSON.stringify(input));
      const { deleteWork: deleteWork2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      try {
        await deleteWork2(input.id);
        console.log("[works.delete] Success - ID:", input.id);
        return { success: true };
      } catch (error) {
        console.error("[works.delete] Error:", error.message);
        throw error;
      }
    })
  }),
  architects: router({
    list: publicProcedure.query(async () => {
      const { getAllArchitects: getAllArchitects2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getAllArchitects2();
    }),
    create: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { createArchitect: createArchitect2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return createArchitect2(input);
    }),
    update: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { updateArchitect: updateArchitect2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await updateArchitect2(input.id, input);
      return input;
    }),
    delete: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { deleteArchitect: deleteArchitect2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await deleteArchitect2(input.id);
      return { success: true };
    })
  }),
  prestadores: router({
    list: publicProcedure.query(async () => {
      const { getAllProviders: getAllProviders2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getAllProviders2();
    }),
    create: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { createProvider: createProvider2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return createProvider2(input);
    }),
    update: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { updateProvider: updateProvider2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await updateProvider2(input.id, input);
      return input;
    }),
    delete: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { deleteProvider: deleteProvider2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await deleteProvider2(input.id);
      return { success: true };
    })
  }),
  categories: router({
    list: publicProcedure.query(async () => {
      const { getAllCategories: getAllCategories2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getAllCategories2();
    }),
    create: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { createCategory: createCategory2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return createCategory2(input);
    }),
    update: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { updateCategory: updateCategory2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await updateCategory2(input.id, input);
      return input;
    }),
    delete: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { deleteCategory: deleteCategory2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await deleteCategory2(input.id);
      return { success: true };
    })
  }),
  remunerations: router({
    list: publicProcedure.query(async () => {
      const { getAllRemunerations: getAllRemunerations2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getAllRemunerations2();
    }),
    create: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { createRemuneration: createRemuneration2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return createRemuneration2(input);
    }),
    update: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { updateRemuneration: updateRemuneration2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await updateRemuneration2(input.id, input);
      return input;
    }),
    delete: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { deleteRemuneration: deleteRemuneration2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await deleteRemuneration2(input.id);
      return { success: true };
    })
  }),
  allocations: router({
    list: publicProcedure.query(async () => {
      const { getAllAllocations: getAllAllocations2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getAllAllocations2();
    }),
    works: publicProcedure.query(async () => {
      const { getWorksWithArchitects: getWorksWithArchitects2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getWorksWithArchitects2();
    }),
    worksWithArchitects: publicProcedure.query(async () => {
      const { getWorksWithArchitects: getWorksWithArchitects2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getWorksWithArchitects2();
    }),
    providers: publicProcedure.query(async () => {
      const { getAllProviders: getAllProviders2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getAllProviders2();
    }),
    architects: publicProcedure.query(async () => {
      const { getAllArchitects: getAllArchitects2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getAllArchitects2();
    }),
    create: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      console.log("[Router] allocations.create input:", JSON.stringify(input, null, 2));
      try {
        const { createAllocation: createAllocation2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const result = await createAllocation2(input);
        console.log("[Router] allocations.create result:", result);
        return result;
      } catch (error) {
        console.error("[Router] allocations.create error:", error.message);
        console.error("[Router] allocations.create error details:", error);
        throw error;
      }
    }),
    update: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      console.log("[Router] allocations.update input:", JSON.stringify(input, null, 2));
      try {
        const { updateAllocation: updateAllocation2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const result = await updateAllocation2(input);
        console.log("[Router] allocations.update result:", result);
        return result;
      } catch (error) {
        console.error("[Router] allocations.update error:", error.message);
        console.error("[Router] allocations.update error details:", error);
        throw error;
      }
    }),
    delete: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { deleteAllocation: deleteAllocation2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return deleteAllocation2(input.id);
    })
  }),
  settings: router({
    getAllCategories: publicProcedure.query(async () => {
      const { getAllCategories: getAllCategories2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getAllCategories2();
    }),
    createCategory: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { createCategory: createCategory2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return createCategory2(input);
    }),
    updateCategory: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { updateCategory: updateCategory2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return updateCategory2(input.id, input);
    }),
    deleteCategory: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { deleteCategory: deleteCategory2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return deleteCategory2(input.id);
    }),
    getAllRemunerations: publicProcedure.query(async () => {
      const { getAllRemunerations: getAllRemunerations2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return getAllRemunerations2();
    }),
    createRemuneration: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { createRemuneration: createRemuneration2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return createRemuneration2(input);
    }),
    updateRemuneration: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { updateRemuneration: updateRemuneration2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return updateRemuneration2(input.id, input);
    }),
    deleteRemuneration: publicProcedure.input((data) => data).mutation(async ({ input }) => {
      const { deleteRemuneration: deleteRemuneration2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      return deleteRemuneration2(input.id);
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  let viteConfig = {};
  try {
    const config = await import("../../vite.config");
    viteConfig = config.default || {};
  } catch (e) {
  }
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path.resolve(import.meta.dirname, "../..", "dist", "public") : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.get("/api/setup-db", async (req, res) => {
    try {
      const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const db = await getDb2();
      if (!db) {
        return res.status(500).json({ success: false, message: "Database connection failed" });
      }
      console.log("[setup-db] Starting database migration...");
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
      for (const migration of migrations) {
        try {
          await db.execute(migration);
          console.log("[setup-db] Executed migration successfully");
        } catch (error) {
          if (error.message && error.message.includes("already exists")) {
            console.log("[setup-db] Table already exists, skipping");
          } else {
            console.warn("[setup-db] Migration warning:", error.message);
          }
        }
      }
      console.log("[setup-db] All migrations completed");
      res.json({ success: true, message: "Database synced successfully" });
    } catch (error) {
      console.error("[setup-db] Error:", error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
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
