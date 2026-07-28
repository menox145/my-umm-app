import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getUser() {
  const cookieStore = await cookies();
  const userData = cookieStore.get("user_data");
  if (!userData) return null;
  return JSON.parse(userData.value);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const bahanId = searchParams.get("bahanId");

    const whereClause: any = {};
    if (bahanId) whereClause.bahanId = bahanId;
    if (user.lokasiId) whereClause.lokasiId = user.lokasiId;

    // Pakai model Request sebagai log pemakaian
    const pemakaian = await prisma.request.findMany({
      where: whereClause,
      include: {
        bahan: { select: { nama: true, satuan: true } },
        lokasi: { select: { nama: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, pemakaian });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching usage logs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { bahanId, jumlah, catatan } = await request.json();
    const qty = Number(jumlah);

    const bahan = await prisma.bahan.findUnique({ where: { id: bahanId } });
    if (!bahan) return NextResponse.json({ message: "Bahan tidak ditemukan." }, { status: 404 });

    if (bahan.stok < qty) {
      return NextResponse.json({ message: `Stok tidak mencukupi. Stok: ${bahan.stok} ${bahan.satuan}` }, { status: 400 });
    }

    const result = await prisma.$transaction([
      prisma.bahan.update({
        where: { id: bahanId },
        data: { stok: bahan.stok - qty },
      }),
      prisma.request.create({
        data: {
          bahanId,
          bahanNama: bahan.nama,
          lokasiId: user.lokasiId || null,
          jumlah: qty,
          jumlahDisetujui: qty,
          status: "APPROVED",
          userId: user.id,
          userName: user.name,
          catatan: catatan || "Pemakaian",
        },
      }),
    ]);

    return NextResponse.json({ success: true, pemakaian: result[1], remainingStock: result[0].stok });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Gagal mencatat pemakaian." }, { status: 500 });
  }
}