import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUser, listUsers } from "@/lib/neon";

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
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const users = await listUsers();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const user = await createUser({
      id: body.id,
      email: body.email,
      password: body.password,
      role: body.role || "KARYAWAN",
      name: body.name,
      lokasiId: body.lokasiId || null,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ message: "Error creating user" }, { status: 500 });
  }
}