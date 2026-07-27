import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const cookieStore = await cookies();
  const userData = cookieStore.get("user_data");
  if (!userData) return false;
  const user = JSON.parse(userData.value);
  return user.role === "ADMIN";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lokasiId = searchParams.get("lokasiId");

    const where = lokasiId ? { lokasiId } : {};
    const stocks = await prisma.stock.findMany({
      where,
      include: { bahan: true, lokasi: true },
      orderBy: { bahan: { nama: "asc" } },
    });

    return NextResponse.json({ success: true, stocks });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching stock" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

    const { bahanId, lokasiId, jumlah } = await request.json();

    const stock = await prisma.stock.upsert({
      where: { bahanId_lokasiId: { bahanId, lokasiId } },
      update: { jumlah: Number(jumlah) || 0 },
      create: { bahanId, lokasiId, jumlah: Number(jumlah) || 0 },
    });

    return NextResponse.json({ success: true, stock });
  } catch (error) {
    return NextResponse.json({ message: "Error saving stock" }, { status: 500 });
  }
}
