import type { User } from "../../drizzle/schema";
import { TRPCError } from "@trpc/server";

/**
 * Permission middleware and utilities for role-based access control
 */

export interface PermissionContext {
  user: User;
  resourceType: 'work' | 'client' | 'architect' | 'provider' | 'allocation';
  resourceId: number;
}

/**
 * Check if user can access a work
 * - ADMIN: can access all
 * - CLIENTE: can access only if obra.clientId = users.linkedId
 * - ARQUITETO: can access only if obra.architectId = users.linkedId
 * - PRESTADOR: cannot access works directly
 */
export function canAccessWork(user: User, workClientId: number | null, workArchitectId: number | null): boolean {
  if (user.role === 'ADMIN') return true;
  
  if (user.role === 'CLIENTE') {
    return user.linkedId === workClientId;
  }
  
  if (user.role === 'ARQUITETO') {
    return user.linkedId === workArchitectId;
  }
  
  // PRESTADOR cannot access works
  return false;
}

/**
 * Check if user can access a client
 * - ADMIN: can access all
 * - CLIENTE: can access only self (linkedId)
 * - Others: cannot access clients
 */
export function canAccessClient(user: User, clientId: number): boolean {
  if (user.role === 'ADMIN') return true;
  
  if (user.role === 'CLIENTE') {
    return user.linkedId === clientId;
  }
  
  return false;
}

/**
 * Check if user can access an architect
 * - ADMIN: can access all
 * - ARQUITETO: can access only self (linkedId)
 * - Others: cannot access architects
 */
export function canAccessArchitect(user: User, architectId: number): boolean {
  if (user.role === 'ADMIN') return true;
  
  if (user.role === 'ARQUITETO') {
    return user.linkedId === architectId;
  }
  
  return false;
}

/**
 * Check if user can access an allocation
 * - ADMIN: can access all
 * - PRESTADOR: can access only if allocations.providerId = users.linkedId
 * - Others: cannot access allocations
 */
export function canAccessAllocation(user: User, allocationProviderId: number): boolean {
  if (user.role === 'ADMIN') return true;
  
  if (user.role === 'PRESTADOR') {
    return user.linkedId === allocationProviderId;
  }
  
  return false;
}

/**
 * Check if user can access a provider
 * - ADMIN: can access all
 * - PRESTADOR: can access only self (linkedId)
 * - Others: cannot access providers
 */
export function canAccessProvider(user: User, providerId: number): boolean {
  if (user.role === 'ADMIN') return true;
  
  if (user.role === 'PRESTADOR') {
    return user.linkedId === providerId;
  }
  
  return false;
}

/**
 * Filter works based on user role
 */
export function filterWorksByRole(user: User, works: any[]): any[] {
  if (user.role === 'ADMIN') return works;
  
  if (user.role === 'CLIENTE') {
    return works.filter(w => w.clientId === user.linkedId);
  }
  
  if (user.role === 'ARQUITETO') {
    return works.filter(w => w.architectId === user.linkedId);
  }
  
  // PRESTADOR cannot see works
  return [];
}

/**
 * Filter allocations based on user role
 */
export function filterAllocationsByRole(user: User, allocations: any[]): any[] {
  if (user.role === 'ADMIN') return allocations;
  
  if (user.role === 'PRESTADOR') {
    return allocations.filter(a => a.providerId === user.linkedId);
  }
  
  // Other roles cannot see allocations
  return [];
}

/**
 * Check if user can edit a resource
 * - ADMIN: can edit all
 * - Others: cannot edit (read-only)
 */
export function canEditResource(user: User): boolean {
  return user.role === 'ADMIN';
}

/**
 * Throw error if user cannot access resource
 */
export function requireAccess(user: User, hasAccess: boolean, message: string = 'Acesso negado'): void {
  if (!hasAccess) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message,
    });
  }
}

/**
 * Throw error if user cannot edit
 */
export function requireEditAccess(user: User): void {
  if (!canEditResource(user)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Você não tem permissão para editar este recurso',
    });
  }
}
