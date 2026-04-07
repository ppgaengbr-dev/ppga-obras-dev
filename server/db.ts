import { drizzle } from 'drizzle-orm/mysql2';
import { InsertUser, users, clients, works, providers, architects, allocations, categories, remunerations, passwordRequests } from "../drizzle/schema";
import { ENV } from './_core/env';
import mysql from 'mysql2/promise';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

// JWT Secret key
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
);

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

// Get connection pool
export async function getPool() {
  if (!_pool && process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      _pool = await mysql.createPool({
        host: url.hostname,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
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

// Generate JWT token for user
export async function generateJWT(userId: number, email: string, role: string): Promise<string> {
  try {
    const token = await new SignJWT({
      userId,
      email,
      role,
      iat: Math.floor(Date.now() / 1000),
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);
    return token;
  } catch (error) {
    console.error('[JWT] Error generating token:', error);
    throw new Error('Failed to generate JWT token');
  }
}

// Verify JWT token
export async function verifyJWT(token: string): Promise<{ userId: number; email: string; role: string }> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { userId: number; email: string; role: string };
  } catch (error) {
    console.error('[JWT] Error verifying token:', error);
    throw new Error('Invalid JWT token');
  }
}

// User queries
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user.length > 0 ? user[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get user by email:', error);
    throw error;
  }
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('[Database] Failed to verify password:', error);
    return false;
  }
}

export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('[Database] Failed to hash password:', error);
    throw error;
  }
}

export async function updateUserPassword(userId: number, hashedPassword: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
  } catch (error) {
    console.error('[Database] Failed to update user password:', error);
    throw error;
  }
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user.length > 0 ? user[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get user by id:', error);
    throw error;
  }
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error('[Database] Failed to get all users:', error);
    throw error;
  }
}

export async function getPendingUsers() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    return await db.select().from(users).where(eq(users.status, 'PENDING'));
  } catch (error) {
    console.error('[Database] Failed to get pending users:', error);
    throw error;
  }
}

// User mutations
export async function createUser(data: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const userData = { ...data };
    if (userData.password) {
      userData.password = await hashPassword(userData.password);
    }
    const result = await db.insert(users).values(userData);
    return result;
  } catch (error) {
    console.error('[Database] Failed to create user:', error);
    throw error;
  }
}

export async function updateUser(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const validFields: any = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      status: data.status,
      linkedType: data.linkedType,
      linkedId: data.linkedId,
      lastSignedIn: data.lastSignedIn,
    };

    Object.keys(validFields).forEach(key => validFields[key] === undefined && delete validFields[key]);

    await db.update(users).set(validFields).where(eq(users.id, id));
  } catch (error) {
    console.error('[Database] Failed to update user:', error);
    throw error;
  }
}

export async function updateUserStatus(userId: number, status: string, role: string, linkedType: string | null, linkedId: number | null) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    await db.update(users).set({
      status,
      role,
      linkedType,
      linkedId,
    }).where(eq(users.id, userId));
  } catch (error) {
    console.error('[Database] Failed to update user status:', error);
    throw error;
  }
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    await db.delete(users).where(eq(users.id, id));
  } catch (error) {
    console.error('[Database] Failed to delete user:', error);
    throw error;
  }
}

// Clients queries
export async function getAllClients() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    return await db.select().from(clients);
  } catch (error) {
    console.error('[Database] Failed to get all clients:', error);
    throw error;
  }
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const client = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    return client.length > 0 ? client[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get client by id:', error);
    throw error;
  }
}

// Clients mutations
export async function createClient(data: any) {
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
      reminder: data.reminder ? 1 : 0,
    };
    
    const result = await db.insert(clients).values(clientData);
    const clientId = result.insertId;
    
    // If status is 'work', create work record automatically
    if (data.status === 'work' && clientId) {
      console.log('[DB] Creating client with status work, creating work record for client:', clientId);
      
      // Validar que workName foi fornecido
      if (!data.workName) {
        throw new Error('workName is required when creating a work');
      }
      
      // Usar o mesmo filtro de campos validos que createWork usa
      const validFields = ['name', 'workName', 'clientName', 'clientId', 'architectId', 'responsible', 'status', 'workValue', 'startDate', 'endDate', 'commission', 'clientPhone', 'clientBirthDate', 'clientAddress', 'clientOrigin', 'clientContact', 'reminder'];
      
      const workData = {
        clientId: clientId,
        clientName: data.fullName,
        name: data.workName,
        workName: data.workName,
        architectId: data.architectId,
        responsible: data.responsible,
        status: data.workStatus || 'Aguardando',
        workValue: cleanWorkValue,
        startDate: data.startDate,
        endDate: data.endDate,
        commission: data.commission,
        clientPhone: data.phone,
        clientBirthDate: data.birthDate,
        clientAddress: data.address,
        clientOrigin: data.origin,
        clientContact: data.contact,
        reminder: data.reminder ? 1 : 0,
      };
      
      // Filtrar apenas campos validos
      const filteredWorkData = Object.keys(workData)
        .filter(key => validFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = workData[key];
          return obj;
        }, {} as any);
      
      console.log('[DB] Creating work record with filtered data:', filteredWorkData);
      await db.insert(works).values(filteredWorkData);
    }
    
    await connection.commit();
    console.log('[DB] createClient transaction completed successfully');
    
    // Retornar cliente completo com status para o frontend
    return {
      insertId: clientId,
      ...clientData,
      id: clientId,
    };
  } catch (error) {
    await connection.rollback();
    console.error('[Database] Failed to create client:', error);
    throw error;
  } finally {
    connection.release();
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
      reminder: data.reminder ? 1 : 0,
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

// Works queries
export async function getAllWorks() {
  const pool = await getPool();
  if (!pool) throw new Error('Database pool not available');
  
  try {
    const connection = await pool.getConnection();
    try {
      // Query that joins works with architects to resolve architectId from clientContact
      const query = `
        SELECT 
          w.*,
          COALESCE(w.architectId, a.id) as resolvedArchitectId
        FROM works w
        LEFT JOIN architects a ON a.officeNameName = w.clientContact
      `;
      
      const [rows] = await connection.execute(query);
      
      // Map the results to include resolvedArchitectId as architectId
      const worksWithArchitectId = (rows as any[]).map(row => ({
        ...row,
        architectId: row.resolvedArchitectId,
      }));
      
      return worksWithArchitectId;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[Database] Failed to get all works:', error);
    throw error;
  }
}

export async function getWorkById(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const work = await db.select().from(works).where(eq(works.id, id)).limit(1);
    return work.length > 0 ? work[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get work by id:', error);
    throw error;
  }
}

// Works mutations
export async function createWork(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    // Validar campos obrigatórios
    if (!data.workName) {
      throw new Error('workName is required');
    }
    
    // Filtrar apenas campos válidos da tabela works
    const validFields = ['name', 'workName', 'clientName', 'clientId', 'architectId', 'responsible', 'status', 'workValue', 'startDate', 'endDate', 'commission', 'clientPhone', 'clientBirthDate', 'clientAddress', 'clientOrigin', 'clientContact', 'reminder'];
    const filteredData = Object.keys(data)
      .filter(key => validFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {} as any);
    
    console.log('[Database] Creating work with filtered data:', filteredData);
    const result = await db.insert(works).values(filteredData);
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
  if (!db) throw new Error('Database not available');
  try {
    return await db.select().from(providers);
  } catch (error) {
    console.error('[Database] Failed to get all providers:', error);
    throw error;
  }
}

export async function getProviderById(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const provider = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
    return provider.length > 0 ? provider[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get provider by id:', error);
    throw error;
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
      fullName: data.fullName,
      status: data.status || 'active',
      cpf: data.cpf,
      birthDate: data.birthDate,
      address: data.address,
      category: data.category,
      observation: data.observation,
      remuneration: data.remuneration,
      baseValue: cleanBaseValue,
      uniformSize: data.uniformSize,
      shoeSize: data.shoeSize,
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
      fullName: data.fullName,
      status: data.status,
      cpf: data.cpf,
      birthDate: data.birthDate,
      address: data.address,
      category: data.category,
      observation: data.observation,
      remuneration: data.remuneration,
      baseValue: cleanBaseValue,
      uniformSize: data.uniformSize,
      shoeSize: data.shoeSize,
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
  if (!db) throw new Error('Database not available');
  try {
    return await db.select().from(architects);
  } catch (error) {
    console.error('[Database] Failed to get all architects:', error);
    throw error;
  }
}

export async function getArchitectById(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const architect = await db.select().from(architects).where(eq(architects.id, id)).limit(1);
    return architect.length > 0 ? architect[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get architect by id:', error);
    throw error;
  }
}

// Architects mutations
export async function createArchitect(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const architectData = {
      name: data.officeNameName || data.name, // Fallback for compatibility
      officeNameName: data.officeNameName,
      status: data.status || 'active',
      address: data.address,
      architectName: data.architectName,
      phone: data.phone,
      birthDate: data.birthDate,
      commission: data.commission,
      observation: data.observation,
      reminder: data.reminder ? 1 : 0,
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
      name: data.officeNameName || data.name, // Fallback for compatibility
      officeNameName: data.officeNameName,
      status: data.status,
      address: data.address,
      architectName: data.architectName,
      phone: data.phone,
      birthDate: data.birthDate,
      commission: data.commission,
      observation: data.observation,
      reminder: data.reminder ? parseInt(data.reminder) : undefined,
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
  if (!db) throw new Error('Database not available');
  try {
    return await db.select().from(allocations);
  } catch (error) {
    console.error('[Database] Failed to get all allocations:', error);
    throw error;
  }
}

export async function getAllocationsByWorkId(workId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    return await db.select().from(allocations).where(eq(allocations.workId, workId));
  } catch (error) {
    console.error('[Database] Failed to get allocations by work id:', error);
    throw error;
  }
}

export async function createAllocation(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    // Validar campos obrigatórios
    if (!data.workId || !data.providerId) {
      throw new Error('workId and providerId are required');
    }

    // Filtrar apenas campos válidos
    const validFields = ['workId', 'workName', 'providerId', 'providerName', 'service', 'startDate', 'endDate', 'startDay', 'endDay', 'week'];
    const filteredData: any = {};
    
    for (const field of validFields) {
      if (field in data) {
        filteredData[field] = data[field];
      }
    }

    const result = await db.insert(allocations).values(filteredData);
    console.log('[DB] createAllocation completed successfully');
    return result;
  } catch (error) {
    console.error('[Database] Failed to create allocation:', error);
    throw error;
  }
}

// Update allocation
export async function updateAllocation(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    // Filtrar apenas campos válidos
    const validFields = ['workId', 'workName', 'providerId', 'providerName', 'service', 'startDate', 'endDate', 'startDay', 'endDay', 'week'];
    const filteredData: any = {};
    
    for (const field of validFields) {
      if (field in data) {
        filteredData[field] = data[field];
      }
    }

    const result = await db.update(allocations).set(filteredData).where(eq(allocations.id, id));
    console.log('[DB] updateAllocation completed successfully');
    return result;
  } catch (error) {
    console.error('[Database] Failed to update allocation:', error);
    throw error;
  }
}

// Delete allocation
export async function deleteAllocation(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const result = await db.delete(allocations).where(eq(allocations.id, id));
    console.log('[DB] deleteAllocation completed successfully');
    return result;
  } catch (error) {
    console.error('[Database] Failed to delete allocation:', error);
    throw error;
  }
}

// Categories queries
export async function getAllCategories() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    return await db.select().from(categories);
  } catch (error) {
    console.error('[Database] Failed to get all categories:', error);
    throw error;
  }
}

// Remunerations queries
export async function getAllRemunerations() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    return await db.select().from(remunerations);
  } catch (error) {
    console.error('[Database] Failed to get all remunerations:', error);
    throw error;
  }
}

// Categories mutations
export async function createCategory(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const result = await db.insert(categories).values({
      name: data.name,
      description: data.description,
    });
    return result;
  } catch (error) {
    console.error('[Database] Failed to create category:', error);
    throw error;
  }
}

export async function updateCategory(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    await db.update(categories).set({
      name: data.name,
      description: data.description,
    }).where(eq(categories.id, id));
  } catch (error) {
    console.error('[Database] Failed to update category:', error);
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

// Remunerations mutations
export async function createRemuneration(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const result = await db.insert(remunerations).values({
      name: data.name,
      description: data.description,
    });
    return result;
  } catch (error) {
    console.error('[Database] Failed to create remuneration:', error);
    throw error;
  }
}

export async function updateRemuneration(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    await db.update(remunerations).set({
      name: data.name,
      description: data.description,
    }).where(eq(remunerations.id, id));
  } catch (error) {
    console.error('[Database] Failed to update remuneration:', error);
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
