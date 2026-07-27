import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getUser() {
  const cookieStore = await cookies();
  const userData = cookieStore.get("user_data"); // harus sama dengan yang di set pas login
  if (!userData) return null;
  try {
    return JSON.parse(userData.value);
  } catch { return null; }
}

// PERBAIKAN: ambil id dari params, bukan searchParams
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    if (user.role !== "ADMIN" && user.role !== "PENGAWAS") {
      return NextResponse.json({ message: "Hanya admin/pengawas yang bisa approve/reject" }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });
    if (!["APPROVED", "REJECTED"].includes(status)) return NextResponse.json({ message: "Status invalid" }, { status: 400 });

    const updated = await prisma.request.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error updating request" }, { status: 500 });
  }
}