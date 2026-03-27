import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clients, works, providers, architects, allocations, categories, remunerations, passwordRequests } from "../drizzle/schema";
import { ENV } from './_core/env';
import mysql from 'mysql2/promise';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
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

// Get raw MySQL connection pool for transactions
export async function getPool() {
  if (!_pool && process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      _pool = mysql.createPool({
        host: url.hostname,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        port: parseInt(url.port || '3306'),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    } catch (error) {
      console.warn("[Database] Failed to create pool:", error);
      _pool = null;
    }
  }
  return _pool;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Works queries - WORKS IS PRIMARY
export async function getAllWorks() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(works);
  } catch (error) {
    console.error('[Database] Failed to get all works:', error);
    return [];
  }
}

export async function getWorkById(id: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(works).where(eq(works.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get work by id:', error);
    return null;
  }
}

export async function getWorkByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(works).where(eq(works.clientId, clientId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get work by client id:', error);
    return null;
  }
}

// Clients queries
export async function getAllClients() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(clients);
  } catch (error) {
    console.error('[Database] Failed to get all clients:', error);
    return [];
  }
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get client by id:', error);
    return null;
  }
}

export async function getClientsByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(clients).where(eq(clients.status, status));
  } catch (error) {
    console.error('[Database] Failed to get clients by status:', error);
    return [];
  }
}

// Clients mutations
export async function createClient(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    
    // Clean workValue: remove "R$", spaces, and convert comma to dot
    let cleanWorkValue = data.workValue;
    if (typeof cleanWorkValue === 'string') {
      cleanWorkValue = cleanWorkValue
        .replace(/R\$\s*/g, '')
        .trim()
        .replace(',', '.');
    }
    
    const clientData = {
      fullName: data.fullName,
      status: data.status || 'prospect',
      phone: data.phone,
      birthDate: data.birthDate,
      address: data.address,
      origin: data.origin,
      contact: data.contact,
      responsible: data.responsible,
      commission: data.commission,
      workName: data.workName,
      workValue: cleanWorkValue,
      startDate: data.startDate,
      endDate: data.endDate,
      workStatus: data.workStatus,
      architectId: data.architectId,
      reminder: data.reminder ? parseInt(data.reminder) : 0,
    };
    
    const result = await db.insert(clients).values(clientData);
    return result;
  } catch (error) {
    console.error('[Database] Failed to create client:', error);
    throw error;
  }
}

export async function updateClient(id: number, data: any) {
  console.log('[DB] updateClient called with:', { id, data });
  const db = await getDb();
  const pool = await getPool();
  
  if (!db || !pool) throw new Error('Database not available');
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Clean workValue: remove "R$", spaces, and convert comma to dot
    let cleanWorkValue = data.workValue;
    if (typeof cleanWorkValue === 'string') {
      cleanWorkValue = cleanWorkValue
        .replace(/R\$\s*/g, '')
        .trim()
        .replace(',', '.');
    }
    
    // Only update valid fields from clients table
    const validFields: any = {
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
      workValue: cleanWorkValue,
      startDate: data.startDate,
      endDate: data.endDate,
      workStatus: data.workStatus,
      reminder: data.reminder ? parseInt(data.reminder) : 0,
    };
    
    // Remove undefined fields
    Object.keys(validFields).forEach(key => validFields[key] === undefined && delete validFields[key]);
    
    // Update client
    await db.update(clients).set(validFields).where(eq(clients.id, id));
    
    // If status is changing to 'work', ensure work record exists
    if (data.status === 'work') {
      console.log('[DB] Status changed to work, checking work record for client:', id);
      
      // Get current client data
      const currentClient = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
      
      if (currentClient.length > 0) {
        const client = currentClient[0];
        
        // Check if work already exists for this client
        const existingWork = await db.select().from(works).where(eq(works.clientId, id)).limit(1);
        
        if (existingWork.length === 0) {
          // Create new work record
          const workData = {
            clientId: id,
            clientName: client.fullName,
            name: data.workName || client.workName || client.fullName,
            workName: data.workName || client.workName,
            architectId: client.architectId,
            responsible: data.responsible || client.responsible,
            status: data.workStatus || 'Aguardando',
            workValue: cleanWorkValue || client.workValue,
            startDate: data.startDate || client.startDate,
            endDate: data.endDate || client.endDate,
            commission: data.commission || client.commission,
            clientPhone: client.phone,
            clientBirthDate: client.birthDate,
            clientAddress: client.address,
            clientOrigin: client.origin,
            clientContact: client.contact,
            reminder: data.reminder ? parseInt(data.reminder) : client.reminder,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          console.log('[DB] Creating work record:', workData);
          await db.insert(works).values(workData);
        } else {
          // Update existing work record
          console.log('[DB] Work already exists for client:', id, '- updating it');
          const workUpdateData: any = {
            clientName: client.fullName,
            name: data.workName || client.workName || client.fullName,
            workName: data.workName || client.workName,
            responsible: data.responsible || client.responsible,
            status: data.workStatus || 'Aguardando',
            workValue: cleanWorkValue || client.workValue,
            startDate: data.startDate || client.startDate,
            endDate: data.endDate || client.endDate,
            commission: data.commission || client.commission,
            clientPhone: client.phone,
            clientBirthDate: client.birthDate,
            clientAddress: client.address,
            clientOrigin: client.origin,
            clientContact: client.contact,
            reminder: data.reminder ? parseInt(data.reminder) : client.reminder,
            updatedAt: new Date(),
          };
          
          Object.keys(workUpdateData).forEach(key => workUpdateData[key] === undefined && delete workUpdateData[key]);
          
          await db.update(works).set(workUpdateData).where(eq(works.id, existingWork[0].id));
        }
      }
    }
    
    await connection.commit();
    console.log('[DB] updateClient transaction completed successfully');
  } catch (error) {
    await connection.rollback();
    console.error('[Database] Failed to update client:', error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    await db.delete(clients).where(eq(clients.id, id));
  } catch (error) {
    console.error('[Database] Failed to delete client:', error);
    throw error;
  }
}

// Works mutations
export async function createWork(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const result = await db.insert(works).values(data);
    return result;
  } catch (error) {
    console.error('[Database] Failed to create work:', error);
    throw error;
  }
}

export async function updateWork(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    // Filtrar apenas campos válidos da tabela works
    const validFields = ['name', 'workName', 'clientName', 'clientId', 'architectId', 'responsible', 'status', 'workValue', 'startDate', 'endDate', 'commission', 'clientPhone', 'clientBirthDate', 'clientAddress', 'clientOrigin', 'clientContact', 'reminder'];
    const filteredData = Object.keys(data)
      .filter(key => validFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {} as any);
    
    console.log('[Database] Updating work with filtered data:', filteredData);
    await db.update(works).set(filteredData).where(eq(works.id, id));
  } catch (error) {
    console.error('[Database] Failed to update work:', error);
    throw error;
  }
}

export async function deleteWork(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    await db.delete(works).where(eq(works.id, id));
  } catch (error) {
    console.error('[Database] Failed to delete work:', error);
    throw error;
  }
}

// Providers queries
export async function getAllProviders() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(providers);
  } catch (error) {
    console.error('[Database] Failed to get all providers:', error);
    return [];
  }
}

export async function getProviderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get provider by id:', error);
    return null;
  }
}

// Providers mutations
export async function createProvider(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    
    // Clean baseValue: remove "R$", spaces, and convert comma to dot
    let cleanBaseValue = data.baseValue;
    if (typeof cleanBaseValue === 'string') {
      cleanBaseValue = cleanBaseValue
        .replace(/R\$\s*/g, '')
        .trim()
        .replace(',', '.');
    }
    
    const providerData = {
      providerName: data.providerName,
      officeNameProvider: data.officeNameProvider,
      status: data.status || 'active',
      address: data.address,
      phone: data.phone,
      birthDate: data.birthDate,
      commission: data.commission,
      observation: data.observation,
      baseValue: cleanBaseValue,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.insert(providers).values(providerData);
    return result;
  } catch (error) {
    console.error('[Database] Failed to create provider:', error);
    throw error;
  }
}

export async function updateProvider(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    
    // Clean baseValue: remove "R$", spaces, and convert comma to dot
    let cleanBaseValue = data.baseValue;
    if (typeof cleanBaseValue === 'string') {
      cleanBaseValue = cleanBaseValue
        .replace(/R\$\s*/g, '')
        .trim()
        .replace(',', '.');
    }
    
    const validFields: any = {
      providerName: data.providerName,
      officeNameProvider: data.officeNameProvider,
      status: data.status,
      address: data.address,
      phone: data.phone,
      birthDate: data.birthDate,
      commission: data.commission,
      observation: data.observation,
      baseValue: cleanBaseValue,
    };
    
    Object.keys(validFields).forEach(key => validFields[key] === undefined && delete validFields[key]);
    
    await db.update(providers).set(validFields).where(eq(providers.id, id));
  } catch (error) {
    console.error('[Database] Failed to update provider:', error);
    throw error;
  }
}

export async function deleteProvider(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    await db.delete(providers).where(eq(providers.id, id));
  } catch (error) {
    console.error('[Database] Failed to delete provider:', error);
    throw error;
  }
}

// Architects queries
export async function getAllArchitects() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(architects);
  } catch (error) {
    console.error('[Database] Failed to get all architects:', error);
    return [];
  }
}

export async function getArchitectById(id: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(architects).where(eq(architects.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get architect by id:', error);
    return null;
  }
}

// Architects mutations
export async function createArchitect(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    
    const architectData = {
      name: data.name,
      officeNameName: data.officeNameName,
      status: data.status || 'active',
      address: data.address,
      architectName: data.architectName,
      phone: data.phone,
      birthDate: data.birthDate,
      commission: data.commission,
      observation: data.observation,
      reminder: data.reminder ? parseInt(data.reminder) : 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.insert(architects).values(architectData);
    return result;
  } catch (error) {
    console.error('[Database] Failed to create architect:', error);
    throw error;
  }
}

export async function updateArchitect(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    
    const validFields: any = {
      name: data.name,
      officeNameName: data.officeNameName,
      status: data.status,
      address: data.address,
      architectName: data.architectName,
      phone: data.phone,
      birthDate: data.birthDate,
      commission: data.commission,
      observation: data.observation,
      reminder: data.reminder ? parseInt(data.reminder) : 0,
    };
    
    Object.keys(validFields).forEach(key => validFields[key] === undefined && delete validFields[key]);
    
    await db.update(architects).set(validFields).where(eq(architects.id, id));
  } catch (error) {
    console.error('[Database] Failed to update architect:', error);
    throw error;
  }
}

export async function deleteArchitect(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    await db.delete(architects).where(eq(architects.id, id));
  } catch (error) {
    console.error('[Database] Failed to delete architect:', error);
    throw error;
  }
}

// Allocations queries
export async function getAllAllocations() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(allocations);
  } catch (error) {
    console.error('[Database] Failed to get all allocations:', error);
    return [];
  }
}

export async function getAllocationsByWorkId(workId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(allocations).where(eq(allocations.workId, workId));
  } catch (error) {
    console.error('[Database] Failed to get allocations by work id:', error);
    return [];
  }
}

export async function getAllocationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(allocations).where(eq(allocations.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get allocation by id:', error);
    return null;
  }
}

// Allocations mutations
export async function createAllocation(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    
    // Clean baseValue: remove "R$", spaces, and convert comma to dot
    let cleanBaseValue = data.baseValue;
    if (typeof cleanBaseValue === 'string') {
      cleanBaseValue = cleanBaseValue
        .replace(/R\$\s*/g, '')
        .trim()
        .replace(',', '.');
    }
    
    console.log('[Database] createAllocation input:', data);
    
    // Verify that work exists before creating allocation
    let workId = data.workId;
    
    // If workId is provided, verify it exists
    if (workId) {
      const workExists = await db.select().from(works).where(eq(works.id, workId)).limit(1);
      if (workExists.length === 0) {
        throw new Error(`Work with ID ${workId} does not exist`);
      }
    } else {
      throw new Error('workId is required');
    }
    
    const allocationData = {
      workId: workId,
      providerId: data.providerId,
      providerName: data.providerName,
      service: data.service,
      startDate: data.startDate,
      endDate: data.endDate,
      category: data.category,
      observation: data.observation,
      remuneration: data.remuneration,
      baseValue: cleanBaseValue,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('[Database] Inserting allocation with workId:', workId);
    const result = await db.insert(allocations).values(allocationData);
    return result;
  } catch (error) {
    console.error('[Database] Failed to create allocation:', error);
    throw error;
  }
}

export async function updateAllocation(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    
    // Clean baseValue: remove "R$", spaces, and convert comma to dot
    let cleanBaseValue = data.baseValue;
    if (typeof cleanBaseValue === 'string') {
      cleanBaseValue = cleanBaseValue
        .replace(/R\$\s*/g, '')
        .trim()
        .replace(',', '.');
    }
    
    const validFields: any = {
      workId: data.workId,
      providerId: data.providerId,
      providerName: data.providerName,
      service: data.service,
      startDate: data.startDate,
      endDate: data.endDate,
      category: data.category,
      observation: data.observation,
      remuneration: data.remuneration,
      baseValue: cleanBaseValue,
    };
    
    Object.keys(validFields).forEach(key => validFields[key] === undefined && delete validFields[key]);
    
    await db.update(allocations).set(validFields).where(eq(allocations.id, id));
  } catch (error) {
    console.error('[Database] Failed to update allocation:', error);
    throw error;
  }
}

export async function deleteAllocation(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    await db.delete(allocations).where(eq(allocations.id, id));
  } catch (error) {
    console.error('[Database] Failed to delete allocation:', error);
    throw error;
  }
}

// Categories queries
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(categories);
  } catch (error) {
    console.error('[Database] Failed to get all categories:', error);
    return [];
  }
}

export async function createCategory(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const result = await db.insert(categories).values(data);
    return result;
  } catch (error) {
    console.error('[Database] Failed to create category:', error);
    throw error;
  }
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    await db.delete(categories).where(eq(categories.id, id));
  } catch (error) {
    console.error('[Database] Failed to delete category:', error);
    throw error;
  }
}

// Remunerations queries
export async function getAllRemunerations() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(remunerations);
  } catch (error) {
    console.error('[Database] Failed to get all remunerations:', error);
    return [];
  }
}

export async function createRemuneration(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const result = await db.insert(remunerations).values(data);
    return result;
  } catch (error) {
    console.error('[Database] Failed to create remuneration:', error);
    throw error;
  }
}

export async function deleteRemuneration(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    await db.delete(remunerations).where(eq(remunerations.id, id));
  } catch (error) {
    console.error('[Database] Failed to delete remuneration:', error);
    throw error;
  }
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get user by email:', error);
    return null;
  }
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get user by id:', error);
    return null;
  }
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  status?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const result = await db.insert(users).values({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: (data.role || 'CLIENTE') as any,
      status: (data.status || 'PENDING') as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return result;
  } catch (error) {
    console.error('[Database] Failed to create user:', error);
    throw error;
  }
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('[Database] Failed to verify password:', error);
    return false;
  }
}

export async function updateUserStatus(userId: number, status: string, role?: string, linkedType?: string | null, linkedId?: number | null) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    const updateData: any = {
      status: status as any,
      updatedAt: new Date(),
    };
    
    if (role) updateData.role = role as any;
    if (linkedType) updateData.linkedType = linkedType as any;
    if (linkedId) updateData.linkedId = linkedId;
    
    await db.update(users).set(updateData).where(eq(users.id, userId));
  } catch (error) {
    console.error('[Database] Failed to update user status:', error);
    throw error;
  }
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error('[Database] Failed to get all users:', error);
    return [];
  }
}

export async function getPendingUsers() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(users).where(eq(users.status, 'PENDING'));
  } catch (error) {
    console.error('[Database] Failed to get pending users:', error);
    return [];
  }
}

export async function createPasswordRequest(userId: number, newPassword: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await db.insert(passwordRequests).values({
      userId,
      newPassword: hashedPassword,
      status: 'PENDING' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return result;
  } catch (error) {
    console.error('[Database] Failed to create password request:', error);
    throw error;
  }
}

export async function getPasswordRequestsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(passwordRequests).where(eq(passwordRequests.userId, userId));
  } catch (error) {
    console.error('[Database] Failed to get password requests:', error);
    return [];
  }
}

export async function getPendingPasswordRequests() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(passwordRequests).where(eq(passwordRequests.status, 'PENDING'));
  } catch (error) {
    console.error('[Database] Failed to get pending password requests:', error);
    return [];
  }
}

export async function approvePasswordRequest(requestId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    const request = await db.select().from(passwordRequests).where(eq(passwordRequests.id, requestId)).limit(1);
    
    if (request.length === 0) {
      throw new Error('Password request not found');
    }
    
    const req = request[0];
    
    // Update password request status
    await db.update(passwordRequests).set({
      status: 'APPROVED' as any,
      updatedAt: new Date(),
    }).where(eq(passwordRequests.id, requestId));
    
    // Update user password
    await db.update(users).set({
      password: req.newPassword,
      updatedAt: new Date(),
    }).where(eq(users.id, req.userId));
  } catch (error) {
    console.error('[Database] Failed to approve password request:', error);
    throw error;
  }
}

export async function rejectPasswordRequest(requestId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  try {
    await db.update(passwordRequests).set({
      status: 'REJECTED' as any,
      updatedAt: new Date(),
    }).where(eq(passwordRequests.id, requestId));
  } catch (error) {
    console.error('[Database] Failed to reject password request:', error);
    throw error;
  }
}
