import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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

// Works queries
export async function getAllWorks() {
  const db = await getDb();
  if (!db) return [];
  try {
    const { clients: clientsTable } = await import('../drizzle/schema');
    const { eq } = await import('drizzle-orm');
    
    // SOURCE OF TRUTH: clients table with status 'work'
    // Opção B: clients é a fonte principal, works é apenas tabela auxiliar
    const clientWorks = await db.select().from(clientsTable).where(
      eq(clientsTable.status, 'work')
    );
    
    // Convert clients with status 'work' to work format
    const works = clientWorks.map((client: any) => ({
      id: client.id,
      name: client.fullName,
      workName: client.workName || client.fullName,
      clientName: client.fullName,
      clientId: client.id,
      status: client.workStatus || 'waiting',
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
      updatedAt: client.updatedAt,
    }));
    
    return works;
  } catch (error) {
    console.error('[Database] Failed to get works:', error);
    return [];
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
    console.error('[Database] Failed to get providers:', error);
    return [];
  }
}

// Allocations queries
export async function getAllAllocations() {
  const db = await getDb();
  if (!db) return [];
  try {
    const { allocations: allocationsTable } = await import('../drizzle/schema');
    const allocations = await db.select().from(allocationsTable);
    // Convert workId and providerId to numbers to ensure type consistency
    return allocations.map(a => ({
      ...a,
      workId: Number(a.workId),
      providerId: Number(a.providerId),
    }));
  } catch (error) {
    console.error('[Database] Failed to get allocations:', error);
    return [];
  }
}

export async function createAllocation(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const { allocations: allocationsTable } = await import('../drizzle/schema');
    
    console.log('[Database] createAllocation input:', data);
    
    // As datas vem como strings no formato YYYY-MM-DD do frontend
    // Manter como strings simples para evitar problemas de timezone
    const startDate = String(data.startDate).trim();
    const endDate = String(data.endDate).trim();
    
    // Validar formato das datas
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      throw new Error('Invalid startDate format. Expected YYYY-MM-DD');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      throw new Error('Invalid endDate format. Expected YYYY-MM-DD');
    }
    
    // Salvar apenas os dados necessarios: startDate, endDate e informacoes da alocacao
    // Nao calcular week/year/startDay/endDay - usar apenas as datas ISO
    const allocationData = {
      workId: data.workId,
      providerId: data.providerId,
      providerName: data.providerName || '',
      service: data.service || '',
      startDate: startDate,
      endDate: endDate,
      category: data.category || '',
      observation: data.observation || '',
      remuneration: data.remuneration || '',
      baseValue: data.baseValue || '',
      // week, year, startDay, endDay sao ignorados - nao sao mais necessarios
    };
    
    console.log('[Database] allocationData to insert:', allocationData);
    
    const result = await db.insert(allocationsTable).values(allocationData);
    return result;
  } catch (error) {
    console.error('[Database] Failed to create allocation:', error);
    throw error;
  }
}

export async function updateAllocation(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const { allocations: allocationsTable } = await import('../drizzle/schema');
    
    console.log('[Database] updateAllocation input:', data);
    
    // As datas vem como strings no formato YYYY-MM-DD do frontend
    // Manter como strings simples para evitar problemas de timezone
    const startDate = String(data.startDate).trim();
    const endDate = String(data.endDate).trim();
    
    // Validar formato das datas
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      throw new Error('Invalid startDate format. Expected YYYY-MM-DD');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      throw new Error('Invalid endDate format. Expected YYYY-MM-DD');
    }
    
    const allocationData = {
      workId: data.workId,
      providerId: data.providerId,
      providerName: data.providerName || '',
      service: data.service || '',
      startDate: startDate,
      endDate: endDate,
      category: data.category || '',
      observation: data.observation || '',
      remuneration: data.remuneration || '',
      baseValue: data.baseValue || '',
    };
    
    console.log('[Database] allocationData to update:', allocationData);
    
    const result = await db.update(allocationsTable).set(allocationData).where(eq(allocationsTable.id, data.id));
    return result;
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

// Get all architects
export async function getAllArchitects() {
  const db = await getDb();
  if (!db) return [];
  try {
    const { architects: architectsTable } = await import('../drizzle/schema');
    return await db.select().from(architectsTable);
  } catch (error) {
    console.error('[Database] Failed to get architects:', error);
    return [];
  }
}

// Get works with architect details
export async function getWorksWithArchitects() {
  const db = await getDb();
  if (!db) return [];
  try {
    const { clients: clientsTable } = await import('../drizzle/schema');
    const { eq } = await import('drizzle-orm');
    
    // SOURCE OF TRUTH: clients with status 'work' are the works for allocations
    const clientWorks = await db.select().from(clientsTable).where(
      eq(clientsTable.status, 'work')
    );
    
    // Map to work format for allocations page
    return clientWorks.map((client: any) => ({
      id: client.id,
      name: client.fullName,
      workName: client.workName || client.fullName,
      clientName: client.fullName,
      clientId: client.id,
      status: client.workStatus || 'waiting',
      workValue: client.workValue || 0,
      startDate: client.startDate,
      endDate: client.endDate,
      responsible: client.responsible,
      architectName: client.architectName || '',
      architectId: client.architectId,
      clientOrigin: client.origin || '',
      clientContact: client.contact || '',
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    }));
  } catch (error) {
    console.error('[Database] Failed to get works with architects:', error);
    return [];
  }
}

// Get allocations with work and provider details
export async function getAllocationsWithDetails() {
  const db = await getDb();
  if (!db) return [];
  try {
    const { allocations: allocationsTable, works: worksTable, providers: providersTable } = await import('../drizzle/schema');

    
    return await db.select().from(allocationsTable);
  } catch (error) {
    console.error('[Database] Failed to get allocations with details:', error);
    return [];
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
    console.error('[Database] Failed to get clients:', error);
    return [];
  }
}

export async function createClient(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const { clients: clientsTable } = await import('../drizzle/schema');
    const { id, ...dataWithoutId } = data;
    // Clean workValue: remove R$, spaces, and convert comma to dot
    if (dataWithoutId.workValue) {
      const cleaned = String(dataWithoutId.workValue)
        .replace(/R\$\s*/g, '')
        .replace(/\./g, '')
        .replace(/,/g, '.')
        .trim();
      dataWithoutId.workValue = parseFloat(cleaned) || 0;
    } else {
      // If workValue is empty or undefined, set to 0
      dataWithoutId.workValue = 0;
    }
    const result = await db.insert(clientsTable).values(dataWithoutId);
    return result;
  } catch (error) {
    console.error('[Database] Failed to create client:', error);
    throw error;
  }
}

export async function updateClient(id: number, data: any) {
  console.log('[DB] updateClient called with:', { id, data });
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const { clients: clientsTable } = await import('../drizzle/schema');
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
      workValue: data.workValue,
      startDate: data.startDate,
      endDate: data.endDate,
      workStatus: data.workStatus,
      reminder: data.reminder ? parseInt(data.reminder) : 0,
    };
    // Remove undefined fields
    Object.keys(validFields).forEach(key => validFields[key] === undefined && delete validFields[key]);
    await db.update(clientsTable).set(validFields).where(eq(clientsTable.id, id));
  } catch (error) {
    console.error('[Database] Failed to update client:', error);
    throw error;
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
    // Delete from clients table (works are clients with status='work')
    const { clients: clientsTable } = await import('../drizzle/schema');
    await db.delete(clientsTable).where(eq(clientsTable.id, id));
  } catch (error) {
    console.error('[Database] Failed to delete work:', error);
    throw error;
  }
}

// Providers mutations
// Force rebuild - v3
export async function createProvider(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const { providers: providersTable } = await import('../drizzle/schema');
    // Remove id field to let the database auto-generate it
    const { id, ...dataWithoutId } = data;
    // Clean baseValue: remove R$, spaces, and convert comma to dot
    if (dataWithoutId.baseValue) {
      const cleaned = String(dataWithoutId.baseValue)
        .replace(/R\$\s*/g, '')
        .replace(/\./g, '')
        .replace(/,/g, '.')
        .trim();
      dataWithoutId.baseValue = parseFloat(cleaned) || 0;
    }
    const result = await db.insert(providersTable).values(dataWithoutId);
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
    await db.update(providersTable).set(data).where(eq(providersTable.id, id));
  } catch (error) {
    console.error('[Database] Failed to update provider:', error);
    throw error;
  }
}

export async function deleteProvider(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const { providers: providersTable, allocations: allocationsTable } = await import('../drizzle/schema');
    
    // Remover alocacoes vinculadas (cascata)
    await db.delete(allocationsTable).where(eq(allocationsTable.providerId, id));
    
    // Depois, deletar o prestador
    await db.delete(providersTable).where(eq(providersTable.id, id));
  } catch (error) {
    console.error('[Database] Failed to delete provider:', error);
    throw error;
  }
}

// Architects mutations
export async function createArchitect(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const { architects: architectsTable } = await import('../drizzle/schema');
    // Remove id to let database auto-generate it
    const { id, ...dataWithoutId } = data;
    // Set name to officeNameName if not provided
    const cleanData = {
      ...dataWithoutId,
      name: dataWithoutId.name || dataWithoutId.officeNameName || 'Unnamed',
    };
    const result = await db.insert(architectsTable).values(cleanData);
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
    await db.update(architectsTable).set(data).where(eq(architectsTable.id, id));
  } catch (error) {
    console.error('[Database] Failed to update architect:', error);
    throw error;
  }
}

export async function deleteArchitect(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const { architects: architectsTable, works: worksTable } = await import('../drizzle/schema');
    
    // Primeiro, remover vinculações de obras
    await db.update(worksTable).set({ architectId: null }).where(eq(worksTable.architectId, id));
    
    // Depois, deletar o arquiteto
    await db.delete(architectsTable).where(eq(architectsTable.id, id));
  } catch (error) {
    console.error('[Database] Failed to delete architect:', error);
    throw error;
  }
}

// Categories queries
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  try {
    const { categories: categoriesTable } = await import('../drizzle/schema');
    return await db.select().from(categoriesTable);
  } catch (error) {
    console.error('[Database] Failed to get categories:', error);
    return [];
  }
}

export async function createCategory(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const { categories: categoriesTable } = await import('../drizzle/schema');
    const result = await db.insert(categoriesTable).values({
      name: data.name,
      description: data.description || '',
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
    const { categories: categoriesTable } = await import('../drizzle/schema');
    await db.update(categoriesTable).set(data).where(eq(categoriesTable.id, id));
  } catch (error) {
    console.error('[Database] Failed to update category:', error);
    throw error;
  }
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const { categories: categoriesTable } = await import('../drizzle/schema');
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
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
    const { remunerations: remunerationsTable } = await import('../drizzle/schema');
    return await db.select().from(remunerationsTable);
  } catch (error) {
    console.error('[Database] Failed to get remunerations:', error);
    return [];
  }
}

export async function createRemuneration(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const { remunerations: remunerationsTable } = await import('../drizzle/schema');
    const result = await db.insert(remunerationsTable).values({
      name: data.name,
      description: data.description || '',
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
    const { remunerations: remunerationsTable } = await import('../drizzle/schema');
    await db.update(remunerationsTable).set(data).where(eq(remunerationsTable.id, id));
  } catch (error) {
    console.error('[Database] Failed to update remuneration:', error);
    throw error;
  }
}

export async function deleteRemuneration(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    const { remunerations: remunerationsTable } = await import('../drizzle/schema');
    await db.delete(remunerationsTable).where(eq(remunerationsTable.id, id));
  } catch (error) {
    console.error('[Database] Failed to delete remuneration:', error);
    throw error;
  }
}
