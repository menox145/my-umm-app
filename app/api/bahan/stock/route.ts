import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lokasiId = searchParams.get("lokasiId");

    let stocks;
    if (lokasiId) {
      stocks = await prisma.stock.findMany({
        where: { lokasiId },
        include: { bahan: true },
        orderBy: { bahan: { nama: "asc" } },
      });
    } else {
      stocks = await prisma.stock.findMany({
        include: { bahan: true, lokasi: true },
        orderBy: { bahan: { nama: "asc" } },
      });
    }

    return NextResponse.json({ success: true, stocks });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching stock" }, { status: 500 });
  }
}
