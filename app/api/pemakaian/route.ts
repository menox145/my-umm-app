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
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM-DD format
    const bahanId = searchParams.get("bahanId");
    const lokasiId = searchParams.get("lokasiId");

    const whereClause: Record<string, any> = {};

    // Filter by role/location
    if (user.role === "PEGAWAI") {
      if (!user.lokasiId) {
        return NextResponse.json({ success: true, pemakaian: [] });
      }
      whereClause.lokasiId = user.lokasiId;
    } else {
      if (lokasiId) {
        whereClause.lokasiId = lokasiId;
      }
    }

    // Filter by bahan
    if (bahanId) {
      whereClause.bahanId = bahanId;
    }

    // Filter by date
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.tanggal = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const pemakaian = await prisma.pemakaian.findMany({
      where: whereClause,
      include: {
        bahan: { select: { nama: true, satuan: true } },
        lokasi: { select: { nama: true } },
      },
      orderBy: { tanggal: "desc" },
    });

    return NextResponse.json({ success: true, pemakaian });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching usage logs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Normally Pegawai logs usage, but we can allow any role that has a lokasiId
    const targetLokasiId = user.lokasiId;
    if (!targetLokasiId) {
      return NextResponse.json(
        { message: "Anda tidak terhubung ke lokasi mana pun untuk melakukan pencatatan pemakaian." },
        { status: 400 }
      );
    }

    const { bahanId, jumlah, tanggal, catatan } = await request.json();
    const qty = Number(jumlah);

    if (!bahanId || qty <= 0) {
      return NextResponse.json({ message: "Bahan dan jumlah pemakaian harus valid." }, { status: 400 });
    }

    // Fetch the material to ensure it exists
    const bahan = await prisma.bahan.findUnique({ where: { id: bahanId } });
    if (!bahan) {
      return NextResponse.json({ message: "Bahan tidak ditemukan." }, { status: 404 });
    }

    // Fetch the stock in the location
    const stock = await prisma.stock.findUnique({
      where: {
        bahanId_lokasiId: {
          bahanId,
          lokasiId: targetLokasiId,
        },
      },
    });

    if (!stock || stock.jumlah < qty) {
      return NextResponse.json(
        { message: `Stok tidak mencukupi. Stok saat ini: ${stock?.jumlah || 0} ${bahan.satuan}` },
        { status: 400 }
      );
    }

    // Reduce stock and create Pemakaian in a transaction
    const [updatedStock, pemakaianRecord] = await prisma.$transaction([
      prisma.stock.update({
        where: {
          bahanId_lokasiId: {
            bahanId,
            lokasiId: targetLokasiId,
          },
        },
        data: {
          jumlah: stock.jumlah - qty,
        },
      }),
      prisma.pemakaian.create({
        data: {
          bahanId,
          bahanNama: bahan.nama,
          lokasiId: targetLokasiId,
          jumlah: qty,
          tanggal: tanggal ? new Date(tanggal) : new Date(),
          catatan: catatan || null,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Pemakaian berhasil dicatat",
      pemakaian: pemakaianRecord,
      remainingStock: updatedStock.jumlah,
    });
  } catch (error: any) {
    console.error("Error creating usage log:", error);
    return NextResponse.json({ message: "Gagal mencatat pemakaian bahan." }, { status: 500 });
  }
}
