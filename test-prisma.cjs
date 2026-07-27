async function main() {
  const { PrismaClient } = require('@prisma/client');
  const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
  const adapter = new PrismaMariaDb('mysql://root:@localhost:3306/my_umm');
  const prisma = new PrismaClient({ adapter });

  try {
    const r = await prisma.request.create({
      data: {
        bahanId: 'seed-minyak',
        bahanNama: 'Minyak Goreng',
        jumlah: 5,
        userId: 'pegawai@ayam.com',
        userName: 'Budi Pegawai',
        lokasiId: 'cmrrexuej0000d4oufhjtt61p',
        catatan: 'test',
        status: 'PENDING',
      }
    });
    console.log('OK:', r.id);
  } catch(e) {
    console.log('ERROR:', e.message?.slice(0, 600));
    console.log('CODE:', e.code);
  }
  await prisma.$disconnect();
}
main();
