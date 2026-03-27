export const VERSION_INFO = {
  version: "1.0.0",
  environment: process.env.NODE_ENV || "dev",
  feature: "auth-complete-system-with-permissions",
  date: new Date().toISOString().split('T')[0],
  changelog: "Auth system with roles (ADMIN, CLIENTE, ARQUITETO, PRESTADOR), user linking, approval flow, prestador restrictions and security rules",
};
