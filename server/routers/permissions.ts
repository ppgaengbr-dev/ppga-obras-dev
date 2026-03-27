import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import * as permissions from "../_core/permissions";

export const permissionsRouter = router({
  // Get works filtered by user role
  getWorksForUser: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Usuário não autenticado",
      });
    }

    try {
      const works = await db.getAllWorks();
      return permissions.filterWorksByRole(ctx.user, works);
    } catch (error: any) {
      console.error("[Permissions] Get works for user error:", error);
      throw error;
    }
  }),

  // Get allocations filtered by user role
  getAllocationsForUser: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Usuário não autenticado",
      });
    }

    try {
      const allocations = await db.getAllAllocations();
      return permissions.filterAllocationsByRole(ctx.user, allocations);
    } catch (error: any) {
      console.error("[Permissions] Get allocations for user error:", error);
      throw error;
    }
  }),

  // Get single work with permission check
  getWork: protectedProcedure
    .input((data: any) => ({
      workId: data.workId as number,
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      try {
        const work = await db.getWorkById(input.workId);
        if (!work) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Obra não encontrada",
          });
        }

        permissions.requireAccess(
          ctx.user,
          permissions.canAccessWork(ctx.user, work.clientId, work.architectId),
          "Você não tem permissão para acessar esta obra"
        );

        return work;
      } catch (error: any) {
        console.error("[Permissions] Get work error:", error);
        throw error;
      }
    }),

  // Get single allocation with permission check
  getAllocation: protectedProcedure
    .input((data: any) => ({
      allocationId: data.allocationId as number,
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não autenticado",
        });
      }

      try {
        const allocation = await db.getAllocationById(input.allocationId);
        if (!allocation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Alocação não encontrada",
          });
        }

        permissions.requireAccess(
          ctx.user,
          permissions.canAccessAllocation(ctx.user, allocation.providerId),
          "Você não tem permissão para acessar esta alocação"
        );

        return allocation;
      } catch (error: any) {
        console.error("[Permissions] Get allocation error:", error);
        throw error;
      }
    }),

  // Check if user can edit resources
  canEdit: protectedProcedure.query(({ ctx }) => {
    if (!ctx.user) {
      return false;
    }
    return permissions.canEditResource(ctx.user);
  }),

  // Check specific permission
  checkPermission: protectedProcedure
    .input((data: any) => ({
      resourceType: data.resourceType as string,
      resourceId: data.resourceId as number,
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) {
        return false;
      }

      try {
        switch (input.resourceType) {
          case 'work': {
            const work = await db.getWorkById(input.resourceId);
            if (!work) return false;
            return permissions.canAccessWork(ctx.user, work.clientId, work.architectId);
          }

          case 'allocation': {
            const allocation = await db.getAllocationById(input.resourceId);
            if (!allocation) return false;
            return permissions.canAccessAllocation(ctx.user, allocation.providerId);
          }

          case 'client': {
            return permissions.canAccessClient(ctx.user, input.resourceId);
          }

          case 'architect': {
            return permissions.canAccessArchitect(ctx.user, input.resourceId);
          }

          case 'provider': {
            return permissions.canAccessProvider(ctx.user, input.resourceId);
          }

          default:
            return false;
        }
      } catch (error: any) {
        console.error("[Permissions] Check permission error:", error);
        return false;
      }
    }),
});
