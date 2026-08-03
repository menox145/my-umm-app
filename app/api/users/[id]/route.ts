import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteUser, updateUser } from "@/lib/neon";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const cookieStore = await cookies();
  const userData = cookieStore.get("user_data");
  if (!userData) return false;
  const user = JSON.parse(userData.value);
  return user.role === "ADMIN";
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const { id } = await params;

    const user = await updateUser(id, {
      email: body.email,
      role: body.role,
      name: body.name,
      lokasiId: body.lokasiId ?? null,
      password: body.password ? body.password : undefined,
    });

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Error updating user" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    const deleted = await deleteUser(id);

    if (!deleted) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Error deleting user" }, { status: 500 });
  }
}
