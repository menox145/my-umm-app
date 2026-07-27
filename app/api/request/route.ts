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

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let requests;
    const include = { lokasi: { select: { id: true, nama: true } } };
    if (user.role === "PEGAWAI") {
      requests = await prisma.request.findMany({
        where: { userId: user.email },
        include,
        orderBy: { createdAt: "desc" },
      });
    } else {
      requests = await prisma.request.findMany({
        include,
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ message: error?.message || "Error fetching requests" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role === "ADMIN") {
      return NextResponse.json({ message: "Admin tidak bisa membuat request" }, { status: 403 });
    }

    const { bahanId, bahanNama, jumlah, catatan } = await request.json();

    const req = await prisma.request.create({
      data: {
        bahanId,
        bahanNama,
        jumlah: Number(jumlah),
        userId: user.email,
        userName: user.name,
        lokasiId: user.lokasiId || null,
        catatan: catatan || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, request: req });
  } catch (error: any) {
    console.error("Error creating request:", error);
    return NextResponse.json({ message: error?.message || "Error creating request" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN" && user.role !== "PENGAWAS") {
      return NextResponse.json({ message: "Hanya admin/pengawas yang bisa approve/reject" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const { status, jumlah, respon } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "ID required" }, { status: 400 });
    }

    const existing = await prisma.request.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    const approveQty = jumlah !== undefined ? Number(jumlah) : existing.jumlah;

    const updateData: Record<string, any> = { status };
    if (respon !== undefined) updateData.respon = respon;

    if (status === "APPROVED") {
      updateData.jumlahDisetujui = approveQty;

      if (existing.lokasiId) {
        const stock = await prisma.stock.upsert({
          where: { bahanId_lokasiId: { bahanId: existing.bahanId, lokasiId: existing.lokasiId } },
          update: { jumlah: { increment: approveQty } },
          create: { bahanId: existing.bahanId, lokasiId: existing.lokasiId, jumlah: approveQty },
        });
      }
    } else if (status === "REJECTED") {
      updateData.jumlahDisetujui = 0;
    }

    const updated = await prisma.request.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error: any) {
    console.error("Error updating request:", error);
    return NextResponse.json({ message: error?.message || "Error updating request" }, { status: 500 });
  }
}