import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  clients: router({
    list: publicProcedure.query(async () => {
      const { getAllClients } = await import('./db');
      return getAllClients();
    }),
    create: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { createClient } = await import('./db');
        return createClient(input);
      }),
    update: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        try {
          console.log('[clients.update] Input:', JSON.stringify(input));
          const { updateClient } = await import('./db');
          const { id, ...data } = input;
          console.log('[clients.update] ID:', id, 'Data:', JSON.stringify(data));
          await updateClient(id, data);
          console.log('[clients.update] Success');
          return input;
        } catch (error: any) {
          console.error('[clients.update] Error:', error.message);
          throw error;
        }
      }),
    delete: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { deleteClient } = await import('./db');
        await deleteClient(input.id);
        return { success: true };
      }),
  }),

  works: router({
    list: publicProcedure.query(async () => {
      const { getAllWorks } = await import('./db');
      return getAllWorks();
    }),
    create: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { createWork } = await import('./db');
        return createWork(input);
      }),
    update: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { updateWork } = await import('./db');
        await updateWork(input.id, input);
        return input;
      }),
    delete: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        console.log('[works.delete] Input:', JSON.stringify(input));
        const { deleteWork } = await import('./db');
        try {
          await deleteWork(input.id);
          console.log('[works.delete] Success - ID:', input.id);
          return { success: true };
        } catch (error: any) {
          console.error('[works.delete] Error:', error.message);
          throw error;
        }
      }),
  }),

  architects: router({
    list: publicProcedure.query(async () => {
      const { getAllArchitects } = await import('./db');
      return getAllArchitects();
    }),
    create: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { createArchitect } = await import('./db');
        return createArchitect(input);
      }),
    update: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { updateArchitect } = await import('./db');
        await updateArchitect(input.id, input);
        return input;
      }),
    delete: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { deleteArchitect } = await import('./db');
        await deleteArchitect(input.id);
        return { success: true };
      }),
  }),

  prestadores: router({
    list: publicProcedure.query(async () => {
      const { getAllProviders } = await import('./db');
      return getAllProviders();
    }),
    create: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { createProvider } = await import('./db');
        return createProvider(input);
      }),
    update: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { updateProvider } = await import('./db');
        await updateProvider(input.id, input);
        return input;
      }),
    delete: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { deleteProvider } = await import('./db');
        await deleteProvider(input.id);
        return { success: true };
      }),
  }),

  categories: router({
    list: publicProcedure.query(async () => {
      const { getAllCategories } = await import('./db');
      return getAllCategories();
    }),
    create: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { createCategory } = await import('./db');
        return createCategory(input);
      }),
    update: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { updateCategory } = await import('./db');
        await updateCategory(input.id, input);
        return input;
      }),
    delete: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { deleteCategory } = await import('./db');
        await deleteCategory(input.id);
        return { success: true };
      }),
  }),

  remunerations: router({
    list: publicProcedure.query(async () => {
      const { getAllRemunerations } = await import('./db');
      return getAllRemunerations();
    }),
    create: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { createRemuneration } = await import('./db');
        return createRemuneration(input);
      }),
    update: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { updateRemuneration } = await import('./db');
        await updateRemuneration(input.id, input);
        return input;
      }),
    delete: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { deleteRemuneration } = await import('./db');
        await deleteRemuneration(input.id);
        return { success: true };
      }),
  }),

  allocations: router({
    list: publicProcedure.query(async () => {
      const { getAllAllocations } = await import('./db');
      return getAllAllocations();
    }),
    works: publicProcedure.query(async () => {
      const { getWorksWithArchitects } = await import('./db');
      return getWorksWithArchitects();
    }),
    worksWithArchitects: publicProcedure.query(async () => {
      const { getWorksWithArchitects } = await import('./db');
      return getWorksWithArchitects();
    }),
    providers: publicProcedure.query(async () => {
      const { getAllProviders } = await import('./db');
      return getAllProviders();
    }),
    architects: publicProcedure.query(async () => {
      const { getAllArchitects } = await import('./db');
      return getAllArchitects();
    }),
    create: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        console.log('[Router] allocations.create input:', JSON.stringify(input, null, 2));
        try {
          const { createAllocation } = await import('./db');
          const result = await createAllocation(input);
          console.log('[Router] allocations.create result:', result);
          return result;
        } catch (error: any) {
          console.error('[Router] allocations.create error:', error.message);
          console.error('[Router] allocations.create error details:', error);
          throw error;
        }
      }),
    update: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        console.log('[Router] allocations.update input:', JSON.stringify(input, null, 2));
        try {
          const { updateAllocation } = await import('./db');
          const result = await updateAllocation(input);
          console.log('[Router] allocations.update result:', result);
          return result;
        } catch (error: any) {
          console.error('[Router] allocations.update error:', error.message);
          console.error('[Router] allocations.update error details:', error);
          throw error;
        }
      }),
    delete: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { deleteAllocation } = await import('./db');
        return deleteAllocation(input.id);
      }),
  }),

  settings: router({
    getAllCategories: publicProcedure.query(async () => {
      const { getAllCategories } = await import('./db');
      return getAllCategories();
    }),
    createCategory: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { createCategory } = await import('./db');
        return createCategory(input);
      }),
    updateCategory: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { updateCategory } = await import('./db');
        return updateCategory(input.id, input);
      }),
    deleteCategory: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { deleteCategory } = await import('./db');
        return deleteCategory(input.id);
      }),
    getAllRemunerations: publicProcedure.query(async () => {
      const { getAllRemunerations } = await import('./db');
      return getAllRemunerations();
    }),
    createRemuneration: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { createRemuneration } = await import('./db');
        return createRemuneration(input);
      }),
    updateRemuneration: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { updateRemuneration } = await import('./db');
        return updateRemuneration(input.id, input);
      }),
    deleteRemuneration: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ input }) => {
        const { deleteRemuneration } = await import('./db');
        return deleteRemuneration(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;

