import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRequest, getBahanById, listRequests, updateRequest } from "@/lib/neon";

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

    const requests = await listRequests(user);
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

    const body = await request.json();
    const bahan = await getBahanById(body.bahanId);
    if (!bahan) {
      return NextResponse.json({ message: "Bahan tidak ditemukan" }, { status: 404 });
    }

    const requestRecord = await createRequest({
      bahanId: body.bahanId,
      bahanNama: bahan.nama,
      jumlah: Number(body.jumlah || 0),
      catatan: body.catatan ?? null,
      userId: user.id,
      userName: user.name,
      lokasiId: user.lokasiId ?? null,
    });

    return NextResponse.json({ success: true, request: requestRecord });
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

    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Missing request id" }, { status: 400 });
    }

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
    console.error("Error updating request:", error);
    return NextResponse.json({ message: error?.message || "Error updating request" }, { status: 500 });
  }
}
