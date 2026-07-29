import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildMariaDbConfig(connectionString: string) {
  const url = new URL(connectionString);
  const config: Record<string, any> = {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname?.slice(1) || undefined,
  };

  const sslAccept = url.searchParams.get("sslaccept")?.toLowerCase();
  if (sslAccept === "strict" || sslAccept === "required" || sslAccept === "true") {
    config.ssl = { rejectUnauthorized: true };
  }

  return config;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL || "mysql://root:@localhost:3306/my_umm";
  const isTiDB = connectionString.includes("tidbcloud.com");
  const config = buildMariaDbConfig(connectionString);

  const databaseCA = process.env.DATABASE_CA;
  if (databaseCA) {
    config.ssl = {
      ...(config.ssl || {}),
      ca: databaseCA,
      rejectUnauthorized: true,
    };
  }

  if (isTiDB && !config.ssl) {
    config.ssl = { rejectUnauthorized: true };
  }

  const adapter = new PrismaMariaDb(config);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;