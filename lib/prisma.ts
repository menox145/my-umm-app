import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function normalizeCertificate(value: string) {
  const replaced = value.replace(/\\n/g, "\n").trim();
  if (replaced.includes("-----BEGIN CERTIFICATE-----")) {
    return replaced;
  }

  try {
    const decoded = Buffer.from(replaced, "base64").toString("utf8").trim();
    if (decoded.includes("-----BEGIN CERTIFICATE-----")) {
      return decoded;
    }
  } catch {
    // ignore invalid base64, fall back to raw value
  }

  return replaced;
}

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
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured. Please set it in Vercel environment variables.");
  }

  const config = buildMariaDbConfig(connectionString);

  const databaseCA = process.env.DATABASE_CA;
  if (databaseCA) {
    config.ssl = {
      ...(config.ssl || {}),
      ca: normalizeCertificate(databaseCA),
      rejectUnauthorized: true,
    };
  }

  if (!config.ssl) {
    config.ssl = { rejectUnauthorized: true };
  }

  const adapter = new PrismaMariaDb(config);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;