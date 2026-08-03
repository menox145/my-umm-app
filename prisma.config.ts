import 'dotenv/config'
import { defineConfig } from 'prisma/config';

const databaseUrl = process.env.DATABASE_URL ?? '';
const neonUrl = process.env.NEON_DATABASE_URL ?? '';
const isTiDB = databaseUrl.includes('tidbcloud') || databaseUrl.includes('gateway01');
const datasourceUrl = (!isTiDB && databaseUrl) ? databaseUrl : (neonUrl || databaseUrl);

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
    seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  },
  datasource: {
    url: datasourceUrl,
  },
});