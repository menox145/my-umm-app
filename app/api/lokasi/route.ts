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

export async function GET() {
  try {
    const lokasi = await prisma.lokasi.findMany({ orderBy: { nama: "asc" } });
    return NextResponse.json({ success: true, lokasi });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching lokasi" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

    const { nama } = await request.json();
    const lokasi = await prisma.lokasi.create({ data: { nama } });
    return NextResponse.json({ success: true, lokasi });
  } catch (error) {
    return NextResponse.json({ message: "Error creating lokasi" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    await prisma.lokasi.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting lokasi" }, { status: 500 });
  }
}