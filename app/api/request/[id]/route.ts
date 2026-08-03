import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateRequest } from "@/lib/neon";

export const dynamic = "force-dynamic";

async function getUser() {
  const cookieStore = await cookies();
  const userData = cookieStore.get("user_data");
  if (!userData) return null;
  try {
    return JSON.parse(userData.value);
  } catch {
    return null;
  }
}

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
    const body = await request.json();
    const requestRecord = await updateRequest(id, {
      status: body.status,
      jumlahDisetujui: body.status === "APPROVED" ? Number(body.jumlah || 0) : null,
      respon: body.respon ?? null,
    });

    if (!requestRecord) {
      return NextResponse.json({ message: "Request tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: requestRecord });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error?.message || "Error updating request" }, { status: 500 });
  }
}
