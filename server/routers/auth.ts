import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "../db";

export const authRouter = router({
  // Register new user
  register: publicProcedure
    .input((data: any) => ({
      name: data.name as string,
      email: data.email as string,
      password: data.password as string,
    }))
    .mutation(async ({ input }) => {
      try {
        // Check if user already exists
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário com este email já existe",
          });
        }

        // Create new user with PENDING status
        await db.createUser({
          name: input.name,
          email: input.email,
          password: input.password,
          role: "CLIENTE",
          status: "PENDING",
        });

        return {
          success: true,
          message: "Cadastro enviado para aprovação do administrador",
        };
      } catch (error: any) {
        console.error("[Auth] Register error:", error);
        throw error;
      }
    }),

  // Login with email and password
  login: publicProcedure
    .input((data: any) => ({
      email: data.email as string,
      password: data.password as string,
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await db.getUserByEmail(input.email);

        if (!user || !user.password) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou senha inválidos",
          });
        }

        // Check if user is approved
        if (user.status !== "APPROVED") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Seu acesso está aguardando aprovação do administrador",
          });
        }

        // Verify password
        const passwordValid = await db.verifyPassword(input.password, user.password);
        if (!passwordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou senha inválidos",
          });
        }

        // Update lastSignedIn
        await db.updateUserStatus(user.id, user.status);

        // Generate JWT token
        const token = await db.generateJWT(user.id, user.email, user.role || 'CLIENTE');

        return {
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            linkedType: user.linkedType,
            linkedId: user.linkedId,
          },
        };
      } catch (error: any) {
        console.error("[Auth] Login error:", error);
        throw error;
      }
    }),

  // Get current user
  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return null;
    }

    try {
      const user = await db.getUserById(ctx.user.id);
      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        linkedType: user.linkedType,
        linkedId: user.linkedId,
      };
    } catch (error: any) {
      console.error("[Auth] Me error:", error);
      return null;
    }
  }),

  // Request password change
  requestPasswordChange: protectedProcedure
    .input((data: any) => ({
      newPassword: data.newPassword as string,
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado",
          });
        }

        await db.createPasswordRequest(ctx.user.id, input.newPassword);

        return {
          success: true,
          message: "Solicitação de troca de senha enviada para aprovação",
        };
      } catch (error: any) {
        console.error("[Auth] Request password change error:", error);
        throw error;
      }
    }),

  // Admin: Get all users
  getAllUsers: adminProcedure.query(async () => {
    try {
      const users = await db.getAllUsers();
      return users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        linkedType: u.linkedType,
        linkedId: u.linkedId,
        createdAt: u.createdAt,
      }));
    } catch (error: any) {
      console.error("[Auth] Get all users error:", error);
      throw error;
    }
  }),

  // Admin: Get pending users
  getPendingUsers: adminProcedure.query(async () => {
    try {
      const users = await db.getPendingUsers();
      return users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        linkedType: u.linkedType,
        linkedId: u.linkedId,
        createdAt: u.createdAt,
      }));
    } catch (error: any) {
      console.error("[Auth] Get pending users error:", error);
      throw error;
    }
  }),

  // Admin: Approve user
  approveUser: adminProcedure
    .input((data: any) => ({
      userId: data.userId as number,
      role: data.role as string,
      linkedType: data.linkedType as string | null,
      linkedId: data.linkedId as number | null,
    }))
    .mutation(async ({ input }) => {
      try {
        // Validate that non-ADMIN users have a link
        if (input.role !== "ADMIN") {
          if (!input.linkedType || !input.linkedId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Usuários não-ADMIN devem ter um vínculo obrigatório",
            });
          }
        }

        await db.updateUserStatus(
          input.userId,
          "APPROVED",
          input.role,
          input.linkedType,
          input.linkedId
        );

        return {
          success: true,
          message: "Usuário aprovado com sucesso",
        };
      } catch (error: any) {
        console.error("[Auth] Approve user error:", error);
        throw error;
      }
    }),

  // Admin: Block user
  blockUser: adminProcedure
    .input((data: any) => ({
      userId: data.userId as number,
    }))
    .mutation(async ({ input }) => {
      try {
        await db.updateUserStatus(input.userId, "BLOCKED");

        return {
          success: true,
          message: "Usuário bloqueado com sucesso",
        };
      } catch (error: any) {
        console.error("[Auth] Block user error:", error);
        throw error;
      }
    }),

  // Admin: Change user role
  changeUserRole: adminProcedure
    .input((data: any) => ({
      userId: data.userId as number,
      role: data.role as string,
      linkedType: data.linkedType as string | null,
      linkedId: data.linkedId as number | null,
    }))
    .mutation(async ({ input }) => {
      try {
        // Validate that non-ADMIN users have a link
        if (input.role !== "ADMIN") {
          if (!input.linkedType || !input.linkedId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Usuários não-ADMIN devem ter um vínculo obrigatório",
            });
          }
        }

        await db.updateUserStatus(
          input.userId,
          "APPROVED",
          input.role,
          input.linkedType,
          input.linkedId
        );

        return {
          success: true,
          message: "Função do usuário alterada com sucesso",
        };
      } catch (error: any) {
        console.error("[Auth] Change user role error:", error);
        throw error;
      }
    }),

  // Admin: Get pending password requests
  getPendingPasswordRequests: adminProcedure.query(async () => {
    try {
      const requests = await db.getPendingPasswordRequests();
      return requests.map((r) => ({
        id: r.id,
        userId: r.userId,
        status: r.status,
        createdAt: r.createdAt,
      }));
    } catch (error: any) {
      console.error("[Auth] Get pending password requests error:", error);
      throw error;
    }
  }),

  // Admin: Approve password request
  approvePasswordRequest: adminProcedure
    .input((data: any) => ({
      requestId: data.requestId as number,
    }))
    .mutation(async ({ input }) => {
      try {
        await db.approvePasswordRequest(input.requestId);

        return {
          success: true,
          message: "Solicitação de troca de senha aprovada",
        };
      } catch (error: any) {
        console.error("[Auth] Approve password request error:", error);
        throw error;
      }
    }),

  // Admin: Reject password request
  rejectPasswordRequest: adminProcedure
    .input((data: any) => ({
      requestId: data.requestId as number,
    }))
    .mutation(async ({ input }) => {
      try {
        await db.rejectPasswordRequest(input.requestId);

        return {
          success: true,
          message: "Solicitação de troca de senha rejeitada",
        };
      } catch (error: any) {
        console.error("[Auth] Reject password request error:", error);
        throw error;
      }
    }),

  // Seed: Create initial admin user
  seed: publicProcedure.mutation(async () => {
    try {
      const existingAdmin = await db.getUserByEmail('ppga.eng.br@gmail.com');
      if (existingAdmin) {
        return {
          success: false,
          message: 'Usuário admin já existe',
        };
      }

      await db.createUser({
        name: 'Renato Araujo',
        email: 'ppga.eng.br@gmail.com',
        password: 'Ppga@2026',
        role: 'ADMIN',
        status: 'APPROVED',
      });

      return {
        success: true,
        message: 'Usuário admin criado com sucesso',
      };
    } catch (error: any) {
      console.error('[Auth] Seed error:', error);
      throw error;
    }
  }),
});
