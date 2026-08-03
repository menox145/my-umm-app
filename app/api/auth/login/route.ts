import { NextRequest, NextResponse } from "next/server"
import { normalizeRole } from "@/lib/role"
import { findUserByEmail } from "@/lib/neon"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const user = await findUserByEmail(email)

    if (!user) return NextResponse.json({ message: "User tidak ditemukan" }, { status: 401 })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return NextResponse.json({ message: "Password salah" }, { status: 401 })

    const userData = {
      id: user.id,
      email: user.email,
      role: normalizeRole(user.role),
      name: user.name,
      lokasiId: user.lokasiId,
    }

    const res = NextResponse.json({ success: true, user: userData })
    res.cookies.set("user_data", JSON.stringify(userData), { path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" })
    res.cookies.set("user", email, { path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" })
    return res
  } catch (e: any) {
    console.error("LOGIN ERROR:", e)
    return NextResponse.json(
      {
        message: "Login gagal. Silakan cek koneksi database dan env Vercel.",
        error: e?.message || String(e),
      },
      { status: 500 }
    )
  }
}