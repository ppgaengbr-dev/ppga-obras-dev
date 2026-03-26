import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['server/_core/index.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outdir: 'dist',
  external: [
    'lightningcss',
    '@tailwindcss/oxide',
    'mysql2',
    '@babel/core',
    '@babel/preset-typescript',
    'vite',
    'express',
    'drizzle-orm',
    'drizzle-orm/mysql-core',
    'drizzle-kit',
  ],
  packages: 'external',
});
