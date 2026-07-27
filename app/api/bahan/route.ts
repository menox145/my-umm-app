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

    const bahan = await prisma.bahan.findMany({
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ success: true, bahan });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching bahan" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { nama, stock, satuan, harga, keterangan } = await request.json();

    const existing = await prisma.bahan.findFirst({ where: { nama } });
    if (existing) {
      return NextResponse.json({ message: "Nama bahan sudah ada" }, { status: 400 });
    }

    const bahan = await prisma.bahan.create({
      data: { 
        nama, 
        satuan: satuan || "unit", 
        harga: Number(harga) || 0, 
        keterangan: keterangan || null 
      },
    });

    return NextResponse.json({ success: true, bahan });
  } catch (error) {
    return NextResponse.json({ message: "Error creating bahan" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { id, nama, stock, satuan, harga, keterangan } = await request.json();

    const bahan = await prisma.bahan.update({
      where: { id },
      data: { 
        nama, 
        satuan: satuan || "unit", 
        harga: Number(harga) || 0, 
        keterangan: keterangan || null 
      },
    });

    return NextResponse.json({ success: true, bahan });
  } catch (error) {
    return NextResponse.json({ message: "Error updating bahan" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID required" }, { status: 400 });
    }

    await prisma.bahan.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting bahan" }, { status: 500 });
  }
}