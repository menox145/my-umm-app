import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Seeding ke TiDB...')

  const password = await bcrypt.hash('123456', 10)

  // Lokasi
  const lokasiA = await prisma.lokasi.upsert({
    where: { id: 'lokasi-a' },
    update: {},
    create: { id: 'lokasi-a', nama: 'Lokasi A' },
  })
  
  const lokasiB = await prisma.lokasi.upsert({
    where: { id: 'lokasi-b' },
    update: {},
    create: { id: 'lokasi-b', nama: 'Lokasi B' },
  })

  // User
  await prisma.user.upsert({
    where: { email: 'admin@ayam.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@ayam.com', password, role: 'ADMIN' },
  })

  await prisma.user.upsert({
    where: { email: 'pegawai@ayam.com' },
    update: {},
    create: { name: 'Budi Pegawai', email: 'pegawai@ayam.com', password, role: 'KARYAWAN', lokasiId: lokasiA.id },
  })

  await prisma.user.upsert({
    where: { email: 'pengawas@ayam.com' },
    update: {},
    create: { name: 'Sari Pengawas', email: 'pengawas@ayam.com', password, role: 'MANAGER' },
  })

  // Bahan
  await prisma.bahan.upsert({
    where: { nama: 'Ayam' },
    update: { satuan: 'kg', stok: 100 },
    create: { id: 'seed-ayam', nama: 'Ayam', satuan: 'kg', stok: 100 },
  })

  await prisma.bahan.upsert({
    where: { nama: 'Minyak Goreng' },
    update: { satuan: 'liter', stok: 50 },
    create: { id: 'seed-minyak', nama: 'Minyak Goreng', satuan: 'liter', stok: 50 },
  })

  await prisma.bahan.upsert({
    where: { nama: 'Tepung Terigu' },
    update: { satuan: 'kg', stok: 75 },
    create: { id: 'seed-tepung', nama: 'Tepung Terigu', satuan: 'kg', stok: 75 },
  })

  console.log('Seed sukses!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })