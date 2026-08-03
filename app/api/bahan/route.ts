import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createBahan, deleteBahan, listBahan, updateBahan } from "@/lib/neon";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const cookieStore = await cookies();
  const userData = cookieStore.get("user_data");
  if (!userData) return false;
  const user = JSON.parse(userData.value);
  return user.role === "ADMIN";
}

export async function GET() {
  try {
    const bahan = await listBahan();
    return NextResponse.json({ success: true, bahan });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Error fetching bahan" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    const body = await request.json();
    const bahan = await createBahan({
      nama: body.nama,
      satuan: body.satuan || "unit",
      harga: Number(body.harga || 0),
      keterangan: body.keterangan ?? null,
    });
    return NextResponse.json({ success: true, bahan });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Error creating bahan" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Missing bahan id" }, { status: 400 });
    const body = await request.json();
    const bahan = await updateBahan(id, {
      nama: body.nama,
      satuan: body.satuan,
      harga: body.harga !== undefined ? Number(body.harga) : undefined,
      keterangan: body.keterangan ?? undefined,
    });
    if (!bahan) return NextResponse.json({ message: "Bahan tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true, bahan });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Error updating bahan" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Missing bahan id" }, { status: 400 });
    const deleted = await deleteBahan(id);
    if (!deleted) return NextResponse.json({ message: "Bahan tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Error deleting bahan" }, { status: 500 });
  }
}
