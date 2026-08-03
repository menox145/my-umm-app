import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getStockByLokasi, upsertStock } from "@/lib/neon";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const cookieStore = await cookies();
  const userData = cookieStore.get("user_data");
  if (!userData) return false;
  const user = JSON.parse(userData.value);
  return user.role === "ADMIN";
}

export async function GET(request: NextRequest) {
  try {
    const lokasiId = new URL(request.url).searchParams.get("lokasiId");
    if (!lokasiId) return NextResponse.json({ message: "Missing lokasiId" }, { status: 400 });
    const stocks = await getStockByLokasi(lokasiId);
    return NextResponse.json({ success: true, stocks });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Error fetching stock" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    const body = await request.json();
    const stock = await upsertStock(body.bahanId, body.lokasiId, Number(body.jumlah || 0));
    return NextResponse.json({ success: true, stock });
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Error saving stock" }, { status: 500 });
  }
}
