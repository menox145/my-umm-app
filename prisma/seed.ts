import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import bcrypt from 'bcryptjs'

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

async function main() {
  const password = await bcrypt.hash('123456', 10)

  const lokasiA = await prisma.lokasi.upsert({
    where: { nama: 'Lokasi A' },
    update: {},
    create: { nama: 'Lokasi A' },
  })
  const lokasiB = await prisma.lokasi.upsert({
    where: { nama: 'Lokasi B' },
    update: {},
    create: { nama: 'Lokasi B' },
  })

  const pegawai = await prisma.user.upsert({
    where: { email: 'pegawai@ayam.com' },
    update: { lokasiId: lokasiA.id },
    create: { name: 'Budi Pegawai', email: 'pegawai@ayam.com', password, role: 'PEGAWAI', lokasiId: lokasiA.id },
  })
  await prisma.user.upsert({
    where: { email: 'pengawas@ayam.com' },
    update: {},
    create: { name: 'Sari Pengawas', email: 'pengawas@ayam.com', password, role: 'PENGAWAS' },
  })
  await prisma.user.upsert({
    where: { email: 'admin@ayam.com' },
    update: {},
    create: { name: 'Admin UMM', email: 'admin@ayam.com', password, role: 'ADMIN' },
  })

  // Seed bahan & stock awal
  const bahanAyam = await prisma.bahan.upsert({
    where: { id: 'seed-ayam' },
    update: { nama: 'Ayam', satuan: 'kg', harga: 35000, keterangan: 'Ayam potong segar' },
    create: { id: 'seed-ayam', nama: 'Ayam', satuan: 'kg', harga: 35000, keterangan: 'Ayam potong segar' },
  })
  const bahanMinyak = await prisma.bahan.upsert({
    where: { id: 'seed-minyak' },
    update: { nama: 'Minyak Goreng', satuan: 'liter', harga: 20000, keterangan: 'Minyak kemasan' },
    create: { id: 'seed-minyak', nama: 'Minyak Goreng', satuan: 'liter', harga: 20000, keterangan: 'Minyak kemasan' },
  })
  const bahanTepung = await prisma.bahan.upsert({
    where: { id: 'seed-tepung' },
    update: { nama: 'Tepung Terigu', satuan: 'kg', harga: 15000, keterangan: 'Tepung protein tinggi' },
    create: { id: 'seed-tepung', nama: 'Tepung Terigu', satuan: 'kg', harga: 15000, keterangan: 'Tepung protein tinggi' },
  })

  // Stock untuk Lokasi A
  await prisma.stock.upsert({
    where: { bahanId_lokasiId: { bahanId: bahanAyam.id, lokasiId: lokasiA.id } },
    update: { jumlah: 50 },
    create: { bahanId: bahanAyam.id, lokasiId: lokasiA.id, jumlah: 50 },
  })
  await prisma.stock.upsert({
    where: { bahanId_lokasiId: { bahanId: bahanMinyak.id, lokasiId: lokasiA.id } },
    update: { jumlah: 20 },
    create: { bahanId: bahanMinyak.id, lokasiId: lokasiA.id, jumlah: 20 },
  })
  await prisma.stock.upsert({
    where: { bahanId_lokasiId: { bahanId: bahanTepung.id, lokasiId: lokasiA.id } },
    update: { jumlah: 30 },
    create: { bahanId: bahanTepung.id, lokasiId: lokasiA.id, jumlah: 30 },
  })

  // Stock untuk Lokasi B
  await prisma.stock.upsert({
    where: { bahanId_lokasiId: { bahanId: bahanAyam.id, lokasiId: lokasiB.id } },
    update: { jumlah: 25 },
    create: { bahanId: bahanAyam.id, lokasiId: lokasiB.id, jumlah: 25 },
  })
  await prisma.stock.upsert({
    where: { bahanId_lokasiId: { bahanId: bahanMinyak.id, lokasiId: lokasiB.id } },
    update: { jumlah: 10 },
    create: { bahanId: bahanMinyak.id, lokasiId: lokasiB.id, jumlah: 10 },
  })

  console.log(' Seed sukses! 3 user, 2 lokasi, 3 bahan, stock terisi')
}
main().then(() => prisma.$disconnect())
