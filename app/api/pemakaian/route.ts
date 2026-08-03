import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createPemakaian, listPemakaian, getBahanById } from "@/lib/neon";

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

    const pemakaian = await listPemakaian(user);
    return NextResponse.json({ success: true, pemakaian });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Error fetching usage logs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const bahan = await getBahanById(body.bahanId);
    if (!bahan) {
      return NextResponse.json({ message: "Bahan tidak ditemukan" }, { status: 404 });
    }

    const pemakaian = await createPemakaian({
      bahanId: body.bahanId,
      bahanNama: bahan.nama,
      jumlah: Number(body.jumlah || 0),
      tanggal: body.tanggal,
      catatan: body.catatan ?? null,
      lokasiId: user.lokasiId ?? null,
      userId: user.id,
      userName: user.name,
    });

    return NextResponse.json({ success: true, pemakaian });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error?.message || "Gagal mencatat pemakaian." }, { status: 500 });
  }
}
