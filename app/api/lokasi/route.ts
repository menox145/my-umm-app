import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createLokasi, deleteLokasi, listLokasi } from "@/lib/neon";

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
    const lokasi = await listLokasi();
    return NextResponse.json({ success: true, lokasi });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Error fetching lokasi" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const lokasi = await createLokasi(body.nama);
    return NextResponse.json({ success: true, lokasi });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Error creating lokasi" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Missing lokasi id" }, { status: 400 });
    const deleted = await deleteLokasi(id);
    if (!deleted) return NextResponse.json({ message: "Lokasi tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Error deleting lokasi" }, { status: 500 });
  }
}
