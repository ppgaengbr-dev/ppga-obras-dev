import { eq } from 'drizzle-orm';
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import mysql from 'mysql2/promise';

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
    const { works: worksTable } = await import('../drizzle/schema');
    return await db.select().from(worksTable);
  } catch (error) {
    console.error('[Database] Failed to get all works:', error);
    return [];
  }
}

export async function getWorkById(id: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const { works: worksTable } = await import('../drizzle/schema');
    const result = await db.select().from(worksTable).where(eq(worksTable.id, id)).limit(1);
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
    const { works: worksTable } = await import('../drizzle/schema');
    const result = await db.select().from(worksTable).where(eq(worksTable.clientId, clientId)).limit(1);
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
    const { clients: clientsTable } = await import('../drizzle/schema');
    return await db.select().from(clientsTable);
  } catch (error) {
    console.error('[Database] Failed to get all clients:', error);
    return [];
  }
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const { clients: clientsTable } = await import('../drizzle/schema');
    const result = await db.select().from(clientsTable).where(eq(clientsTable.id, id)).limit(1);
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
    const { clients: clientsTable } = await import('../drizzle/schema');
    return await db.select().from(clientsTable).where(eq(clientsTable.status, status));
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
    const { clients: clientsTable } = await import('../drizzle/schema');
    
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
    
    const result = await db.insert(clientsTable).values(clientData);
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
    
    const { clients: clientsTable, works: worksTable } = await import('../drizzle/schema');
    
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
    await db.update(clientsTable).set(validFields).where(eq(clientsTable.id, id));
    
    // If status is changing to 'work', ensure work record exists
    if (data.status === 'work') {
      console.log('[DB] Status changed to work, checking work record for client:', id);
      
      // Get current client data
      const currentClient = await db.select().from(clientsTable).where(eq(clientsTable.id, id)).limit(1);
      
      if (currentClient.length > 0) {
        const client = currentClient[0];
        
        // Check if work already exists for this client
        const existingWork = await db.select().from(worksTable).where(eq(worksTable.clientId, id)).limit(1);
        
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
          await db.insert(worksTable).values(workData);
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
          
          await db.update(worksTable).set(workUpdateData).where(eq(worksTable.id, existingWork[0].id));
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
    const { clients: clientsTable } = await import('../drizzle/schema');
    await db.delete(clientsTable).where(eq(clientsTable.id, id));
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
    const { works: worksTable } = await import('../drizzle/schema');
    const result = await db.insert(worksTable).values(data);
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
    const { works: worksTable } = await import('../drizzle/schema');
    // Filtrar apenas campos válidos da tabela works
    const validFields = ['name', 'workName', 'clientName', 'clientId', 'architectId', 'responsible', 'status', 'workValue', 'startDate', 'endDate', 'commission', 'clientPhone', 'clientBirthDate', 'clientAddress', 'clientOrigin', 'clientContact', 'reminder'];
    const filteredData = Object.keys(data)
      .filter(key => validFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {} as any);
    
    console.log('[Database] Updating work with filtered data:', filteredData);
    await db.update(worksTable).set(filteredData).where(eq(worksTable.id, id));
  } catch (error) {
    console.error('[Database] Failed to update work:', error);
    throw error;
  }
}

export async function deleteWork(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const { works: worksTable } = await import('../drizzle/schema');
    await db.delete(worksTable).where(eq(worksTable.id, id));
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
    const { providers: providersTable } = await import('../drizzle/schema');
    return await db.select().from(providersTable);
  } catch (error) {
    console.error('[Database] Failed to get all providers:', error);
    return [];
  }
}

export async function getProviderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const { providers: providersTable } = await import('../drizzle/schema');
    const result = await db.select().from(providersTable).where(eq(providersTable.id, id)).limit(1);
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
    const { providers: providersTable } = await import('../drizzle/schema');
    
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
    
    const result = await db.insert(providersTable).values(providerData);
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
    const { providers: providersTable } = await import('../drizzle/schema');
    
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
    
    await db.update(providersTable).set(validFields).where(eq(providersTable.id, id));
  } catch (error) {
    console.error('[Database] Failed to update provider:', error);
    throw error;
  }
}

export async function deleteProvider(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const { providers: providersTable } = await import('../drizzle/schema');
    await db.delete(providersTable).where(eq(providersTable.id, id));
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
    const { architects: architectsTable } = await import('../drizzle/schema');
    return await db.select().from(architectsTable);
  } catch (error) {
    console.error('[Database] Failed to get all architects:', error);
    return [];
  }
}

export async function getArchitectById(id: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const { architects: architectsTable } = await import('../drizzle/schema');
    const result = await db.select().from(architectsTable).where(eq(architectsTable.id, id)).limit(1);
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
    const { architects: architectsTable } = await import('../drizzle/schema');
    
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
    
    const result = await db.insert(architectsTable).values(architectData);
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
    const { architects: architectsTable } = await import('../drizzle/schema');
    
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
    
    await db.update(architectsTable).set(validFields).where(eq(architectsTable.id, id));
  } catch (error) {
    console.error('[Database] Failed to update architect:', error);
    throw error;
  }
}

export async function deleteArchitect(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const { architects: architectsTable } = await import('../drizzle/schema');
    await db.delete(architectsTable).where(eq(architectsTable.id, id));
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
    const { allocations: allocationsTable } = await import('../drizzle/schema');
    return await db.select().from(allocationsTable);
  } catch (error) {
    console.error('[Database] Failed to get all allocations:', error);
    return [];
  }
}

export async function getAllocationsByWorkId(workId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    const { allocations: allocationsTable } = await import('../drizzle/schema');
    return await db.select().from(allocationsTable).where(eq(allocationsTable.workId, workId));
  } catch (error) {
    console.error('[Database] Failed to get allocations by work id:', error);
    return [];
  }
}

export async function getAllocationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const { allocations: allocationsTable } = await import('../drizzle/schema');
    const result = await db.select().from(allocationsTable).where(eq(allocationsTable.id, id)).limit(1);
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
    const { allocations: allocationsTable, works: worksTable } = await import('../drizzle/schema');
    
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
      const workExists = await db.select().from(worksTable).where(eq(worksTable.id, workId)).limit(1);
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
    const result = await db.insert(allocationsTable).values(allocationData);
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
    const { allocations: allocationsTable } = await import('../drizzle/schema');
    
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
    
    await db.update(allocationsTable).set(validFields).where(eq(allocationsTable.id, id));
  } catch (error) {
    console.error('[Database] Failed to update allocation:', error);
    throw error;
  }
}

export async function deleteAllocation(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const { allocations: allocationsTable } = await import('../drizzle/schema');
    await db.delete(allocationsTable).where(eq(allocationsTable.id, id));
  } catch (error) {
    console.error('[Database] Failed to delete allocation:', error);
    throw error;
  }
}
