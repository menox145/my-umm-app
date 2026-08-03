import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export type UserRecord = {
  id: string;
  email: string;
  password: string;
  role: string;
  name: string;
  lokasiId?: string | null;
  createdAt?: string;
};

export type LokasiRecord = {
  id: string;
  nama: string;
  createdAt?: string;
};

export type BahanRecord = {
  id: string;
  nama: string;
  satuan: string;
  harga: number;
  keterangan: string | null;
  createdAt?: string;
};

export type StockRecord = {
  id: string;
  bahanId: string;
  lokasiId: string;
  jumlah: number;
  createdAt?: string;
  bahan?: { id: string; nama: string; satuan: string };
  lokasi?: { id: string; nama: string };
};

export type RequestRecord = {
  id: string;
  bahanId: string;
  bahanNama: string;
  jumlah: number;
  jumlahDisetujui: number | null;
  status: string;
  userId: string;
  userName: string;
  lokasiId?: string | null;
  lokasi?: { id: string; nama: string } | null;
  catatan: string | null;
  respon: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PemakaianRecord = {
  id: string;
  bahanId: string;
  bahanNama: string;
  jumlah: number;
  tanggal: string;
  catatan: string | null;
  lokasiId?: string | null;
  userId: string;
  userName: string;
  createdAt?: string;
  bahan?: { id: string; nama: string; satuan: string } | null;
  lokasi?: { id: string; nama: string } | null;
};

const FALLBACK_USERS: UserRecord[] = [
  {
    id: "seed-admin",
    email: "admin@ayam.com",
    password: "$2a$10$z6A1jAYRG3j6sR2i5n6nYe4bV9zzhVDO4Yb3T4sXh0ZK55kMXFIzC",
    role: "ADMIN",
    name: "Admin",
    lokasiId: null,
  },
  {
    id: "seed-pegawai",
    email: "pegawai@ayam.com",
    password: "$2a$10$VCdPn3Y7H6ejo8nWqU7I1uQ8YfA0JdQpCGJ7FCuZIyM9gVqj9CPm2",
    role: "KARYAWAN",
    name: "Budi Pegawai",
    lokasiId: "lokasi-a",
  },
  {
    id: "seed-pengawas",
    email: "pengawas@ayam.com",
    password: "$2a$10$VCdPn3Y7H6ejo8nWqU7I1uQ8YfA0JdQpCGJ7FCuZIyM9gVqj9CPm2",
    role: "MANAGER",
    name: "Sari Pengawas",
    lokasiId: null,
  },
];

let sqlClient: any = null;

function getSql() {
  if (!process.env.DATABASE_URL) return null;
  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }
  return sqlClient;
}

async function ensureTables() {
  const sql = getSql();
  if (!sql) return false;

  try {
    await sql`CREATE TABLE IF NOT EXISTS lokasi (
      id TEXT PRIMARY KEY,
      nama TEXT NOT NULL UNIQUE,
      createdAt TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      lokasiId TEXT,
      createdAt TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS bahan (
      id TEXT PRIMARY KEY,
      nama TEXT UNIQUE NOT NULL,
      satuan TEXT NOT NULL,
      harga NUMERIC NOT NULL DEFAULT 0,
      keterangan TEXT,
      createdAt TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS stock (
      id TEXT PRIMARY KEY,
      bahanId TEXT NOT NULL,
      lokasiId TEXT NOT NULL,
      jumlah INT NOT NULL DEFAULT 0,
      createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (bahanId, lokasiId)
    )`;

    await sql`CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      bahanId TEXT NOT NULL,
      bahanNama TEXT NOT NULL,
      jumlah INT NOT NULL,
      jumlahDisetujui INT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      userId TEXT NOT NULL,
      userName TEXT NOT NULL,
      lokasiId TEXT,
      catatan TEXT,
      respon TEXT,
      createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
      updatedAt TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS pemakaian (
      id TEXT PRIMARY KEY,
      bahanId TEXT NOT NULL,
      bahanNama TEXT NOT NULL,
      jumlah INT NOT NULL,
      tanggal DATE NOT NULL,
      catatan TEXT,
      lokasiId TEXT,
      userId TEXT NOT NULL,
      userName TEXT NOT NULL,
      createdAt TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    return true;
  } catch (error) {
    console.error("Neon ensureTables error:", error);
    return false;
  }
}

async function ensureSeedUsers() {
  const sql = getSql();
  if (!sql) return false;

  try {
    await ensureTables();

    await sql`INSERT INTO lokasi (id, nama) VALUES ('lokasi-a', 'Lokasi A') ON CONFLICT (id) DO NOTHING`;

    const existing = await sql`SELECT id FROM users WHERE email = 'admin@ayam.com' LIMIT 1`;
    if (existing.length > 0) return true;

    const password = await bcrypt.hash("123456", 10);
    await sql`INSERT INTO users (id, email, password, role, name, lokasiId) VALUES
      ('seed-admin', 'admin@ayam.com', ${password}, 'ADMIN', 'Admin', NULL),
      ('seed-pegawai', 'pegawai@ayam.com', ${password}, 'KARYAWAN', 'Budi Pegawai', 'lokasi-a'),
      ('seed-pengawas', 'pengawas@ayam.com', ${password}, 'MANAGER', 'Sari Pengawas', NULL)`;

    return true;
  } catch (error) {
    console.error("Neon seed error:", error);
    return false;
  }
}

export async function findUserByEmail(email: string) {
  const sql = getSql();
  if (!sql) return FALLBACK_USERS.find((user) => user.email === email) || null;

  try {
    await ensureSeedUsers();
    const rows = await sql`SELECT id, email, password, role, name, lokasiId FROM users WHERE email = ${email} LIMIT 1`;
    if (rows.length > 0) {
      const row = rows[0] as any;
      return {
        id: row.id,
        email: row.email,
        password: row.password,
        role: row.role,
        name: row.name,
        lokasiId: row.lokasiId,
        createdAt: row.createdat,
      } as UserRecord;
    }
  } catch (error) {
    console.error("Neon user lookup error:", error);
  }

  return FALLBACK_USERS.find((user) => user.email === email) || null;
}

export async function listUsers() {
  const sql = getSql();
  if (!sql) return [];
  await ensureTables();
  const rows = await sql`SELECT id, email, role, name, lokasiId, createdAt FROM users ORDER BY createdAt DESC`;
  return rows as UserRecord[];
}

export async function getUserById(id: string) {
  const sql = getSql();
  if (!sql) return null;
  await ensureTables();
  const rows = await sql`SELECT id, email, role, name, lokasiId, createdAt FROM users WHERE id = ${id} LIMIT 1`;
  return rows.length > 0 ? (rows[0] as UserRecord) : null;
}

export async function createUser(input: Omit<UserRecord, "id"> & { id?: string }) {
  const sql = getSql();
  if (!sql) return null;
  await ensureTables();
  const id = input.id || `user-${randomUUID()}`;
  const password = await bcrypt.hash(input.password, 10);
  await sql`INSERT INTO users (id, email, password, role, name, lokasiId) VALUES (${id}, ${input.email}, ${password}, ${input.role}, ${input.name}, ${input.lokasiId ?? null})`;
  return { ...input, id, password, createdAt: new Date().toISOString() } as UserRecord;
}

export async function updateUser(id: string, input: Partial<UserRecord>) {
  const sql = getSql();
  if (!sql) return null;
  await ensureTables();
  const rows = await sql`SELECT id, email, password, role, name, lokasiId FROM users WHERE id = ${id} LIMIT 1`;
  if (!rows.length) return null;
  const current = rows[0] as any;
  const hashedPassword = input.password ? await bcrypt.hash(input.password, 10) : current.password;
  const next = {
    ...current,
    ...input,
    password: hashedPassword,
    lokasiId: input.lokasiId ?? current.lokasiid,
  };
  await sql`UPDATE users SET email = ${next.email}, password = ${next.password}, role = ${next.role}, name = ${next.name}, lokasiId = ${next.lokasiId ?? null} WHERE id = ${id}`;
  return {
    id,
    email: next.email,
    role: next.role,
    name: next.name,
    lokasiId: next.lokasiId,
  } as UserRecord;
}

export async function deleteUser(id: string) {
  const sql = getSql();
  if (!sql) return false;
  await ensureTables();
  await sql`DELETE FROM users WHERE id = ${id}`;
  return true;
}

export async function listLokasi() {
  const sql = getSql();
  if (!sql) return [];
  await ensureTables();
  const rows = await sql`SELECT id, nama, createdAt FROM lokasi ORDER BY nama ASC`;
  return rows as LokasiRecord[];
}

export async function createLokasi(nama: string) {
  const sql = getSql();
  if (!sql) return null;
  await ensureTables();
  const id = `lokasi-${randomUUID()}`;
  await sql`INSERT INTO lokasi (id, nama) VALUES (${id}, ${nama})`;
  return { id, nama } as LokasiRecord;
}

export async function deleteLokasi(id: string) {
  const sql = getSql();
  if (!sql) return false;
  await ensureTables();
  await sql`DELETE FROM lokasi WHERE id = ${id}`;
  return true;
}

export async function listBahan() {
  const sql = getSql();
  if (!sql) return [];
  await ensureTables();
  const rows = await sql`SELECT id, nama, satuan, harga, keterangan, createdAt FROM bahan ORDER BY nama ASC`;
  return rows as BahanRecord[];
}

export async function getBahanById(id: string) {
  const sql = getSql();
  if (!sql) return null;
  await ensureTables();
  const rows = await sql`SELECT id, nama, satuan, harga, keterangan, createdAt FROM bahan WHERE id = ${id} LIMIT 1`;
  return rows.length > 0 ? (rows[0] as BahanRecord) : null;
}

export async function createBahan(input: Omit<BahanRecord, "id" | "createdAt"> & { id?: string }) {
  const sql = getSql();
  if (!sql) return null;
  await ensureTables();
  const id = input.id || `bahan-${randomUUID()}`;
  await sql`INSERT INTO bahan (id, nama, satuan, harga, keterangan) VALUES (${id}, ${input.nama}, ${input.satuan}, ${input.harga}, ${input.keterangan})`;
  return { ...input, id } as BahanRecord;
}

export async function updateBahan(id: string, input: Partial<BahanRecord>) {
  const sql = getSql();
  if (!sql) return null;
  await ensureTables();
  const rows = await sql`SELECT id, nama, satuan, harga, keterangan FROM bahan WHERE id = ${id} LIMIT 1`;
  if (!rows.length) return null;
  const current = rows[0] as any;
  const next = {
    ...current,
    ...input,
    id,
  };
  await sql`UPDATE bahan SET nama = ${next.nama}, satuan = ${next.satuan}, harga = ${next.harga}, keterangan = ${next.keterangan} WHERE id = ${id}`;
  return next as BahanRecord;
}

export async function deleteBahan(id: string) {
  const sql = getSql();
  if (!sql) return false;
  await ensureTables();
  await sql`DELETE FROM bahan WHERE id = ${id}`;
  return true;
}

export async function getStockByLokasi(lokasiId: string) {
  const sql = getSql();
  if (!sql) return [];
  await ensureTables();
  const rows = await sql`
    SELECT
      s.id,
      s.bahanId,
      s.lokasiId,
      s.jumlah,
      json_build_object('id', b.id, 'nama', b.nama, 'satuan', b.satuan) AS bahan,
      json_build_object('id', l.id, 'nama', l.nama) AS lokasi
    FROM stock s
    LEFT JOIN bahan b ON b.id = s.bahanId
    LEFT JOIN lokasi l ON l.id = s.lokasiId
    WHERE s.lokasiId = ${lokasiId}
    ORDER BY b.nama ASC
  `;
  return rows as StockRecord[];
}

export async function upsertStock(bahanId: string, lokasiId: string, jumlah: number) {
  const sql = getSql();
  if (!sql) return null;
  await ensureTables();
  const id = `stock-${randomUUID()}`;
  const rows = await sql`
    INSERT INTO stock (id, bahanId, lokasiId, jumlah)
    VALUES (${id}, ${bahanId}, ${lokasiId}, ${jumlah})
    ON CONFLICT (bahanId, lokasiId)
    DO UPDATE SET jumlah = EXCLUDED.jumlah
    RETURNING id, bahanId, lokasiId, jumlah
  `;
  return rows.length > 0 ? (rows[0] as StockRecord) : null;
}

export async function listRequests(user?: { id: string; role: string; lokasiId?: string | null }) {
  const sql = getSql();
  if (!sql) return [];
  await ensureTables();
  const filter = user && user.role !== "ADMIN" && user.role !== "PENGAWAS";
  const rows = await sql`
    SELECT
      r.id,
      r.bahanId,
      r.bahanNama,
      r.jumlah,
      r.jumlahDisetujui,
      r.status,
      r.userId,
      r.userName,
      r.lokasiId,
      json_build_object('id', l.id, 'nama', l.nama) AS lokasi,
      r.catatan,
      r.respon,
      r.createdAt,
      r.updatedAt
    FROM requests r
    LEFT JOIN lokasi l ON l.id = r.lokasiId
    ${filter ? sql`WHERE r.userId = ${user.id}` : sql``}
    ORDER BY r.createdAt DESC
  `;
  return rows as RequestRecord[];
}

export async function createRequest(input: {
  bahanId: string;
  bahanNama: string;
  jumlah: number;
  catatan?: string | null;
  userId: string;
  userName: string;
  lokasiId?: string | null;
}) {
  const sql = getSql();
  if (!sql) return null;
  await ensureTables();
  const id = `request-${randomUUID()}`;
  await sql`
    INSERT INTO requests (id, bahanId, bahanNama, jumlah, userId, userName, lokasiId, catatan)
    VALUES (${id}, ${input.bahanId}, ${input.bahanNama}, ${input.jumlah}, ${input.userId}, ${input.userName}, ${input.lokasiId ?? null}, ${input.catatan ?? null})
  `;
  return { ...input, id, jumlahDisetujui: null, status: "PENDING" } as RequestRecord;
}

export async function updateRequest(id: string, input: { status: string; jumlahDisetujui?: number | null; respon?: string | null }) {
  const sql = getSql();
  if (!sql) return null;
  await ensureTables();
  const rows = await sql`SELECT id FROM requests WHERE id = ${id} LIMIT 1`;
  if (!rows.length) return null;
  const jumlahDisetujui = input.status === "APPROVED" ? input.jumlahDisetujui ?? null : null;
  await sql`
    UPDATE requests
    SET status = ${input.status}, jumlahDisetujui = ${jumlahDisetujui}, respon = ${input.respon ?? null}, updatedAt = now()
    WHERE id = ${id}
  `;
  const updated = await sql`
    SELECT
      r.id,
      r.bahanId,
      r.bahanNama,
      r.jumlah,
      r.jumlahDisetujui,
      r.status,
      r.userId,
      r.userName,
      r.lokasiId,
      json_build_object('id', l.id, 'nama', l.nama) AS lokasi,
      r.catatan,
      r.respon,
      r.createdAt,
      r.updatedAt
    FROM requests r
    LEFT JOIN lokasi l ON l.id = r.lokasiId
    WHERE r.id = ${id}
    LIMIT 1
  `;
  return updated.length > 0 ? (updated[0] as RequestRecord) : null;
}

export async function listPemakaian(user?: { role: string; lokasiId?: string | null }) {
  const sql = getSql();
  if (!sql) return [];
  await ensureTables();
  const filter = user && user.role !== "ADMIN";
  const rows = await sql`
    SELECT
      p.id,
      p.bahanId,
      p.bahanNama,
      p.jumlah,
      p.tanggal,
      p.catatan,
      p.lokasiId,
      p.userId,
      p.userName,
      p.createdAt,
      json_build_object('id', b.id, 'nama', b.nama, 'satuan', b.satuan) AS bahan,
      json_build_object('id', l.id, 'nama', l.nama) AS lokasi
    FROM pemakaian p
    LEFT JOIN bahan b ON b.id = p.bahanId
    LEFT JOIN lokasi l ON l.id = p.lokasiId
    ${filter ? sql`WHERE p.lokasiId = ${user.lokasiId}` : sql``}
    ORDER BY p.tanggal DESC, p.createdAt DESC
  `;
  return rows as PemakaianRecord[];
}

export async function createPemakaian(input: {
  bahanId: string;
  bahanNama: string;
  jumlah: number;
  tanggal: string;
  catatan?: string | null;
  lokasiId?: string | null;
  userId: string;
  userName: string;
}) {
  const sql = getSql();
  if (!sql) return null;
  await ensureTables();

  if (!input.lokasiId) {
    throw new Error("Lokasi tidak ditemukan untuk pemakaian.");
  }

  const stockRows = await sql`SELECT id, jumlah FROM stock WHERE bahanId = ${input.bahanId} AND lokasiId = ${input.lokasiId} LIMIT 1`;
  if (!stockRows.length) {
    throw new Error("Stok tidak ditemukan untuk bahan ini di lokasi.");
  }

  const existingStock = stockRows[0] as any;
  if (existingStock.jumlah < input.jumlah) {
    throw new Error("Stok tidak mencukupi.");
  }

  const id = `pemakaian-${randomUUID()}`;
  await sql`
    INSERT INTO pemakaian (id, bahanId, bahanNama, jumlah, tanggal, catatan, lokasiId, userId, userName)
    VALUES (${id}, ${input.bahanId}, ${input.bahanNama}, ${input.jumlah}, ${input.tanggal}, ${input.catatan ?? null}, ${input.lokasiId}, ${input.userId}, ${input.userName})
  `;

  await sql`
    UPDATE stock SET jumlah = ${existingStock.jumlah - input.jumlah} WHERE id = ${existingStock.id}
  `;

  return {
    id,
    ...input,
  } as PemakaianRecord;
}
