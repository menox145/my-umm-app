import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ message: "User tidak ditemukan" }, { status: 401 })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return NextResponse.json({ message: "Password salah" }, { status: 401 })

    const userData = { id: user.id, email: user.email, role: user.role, name: user.name, lokasiId: (user as any).lokasiId }
    const res = NextResponse.json({ success: true, user: userData })
    res.cookies.set("user_data", JSON.stringify(userData), { path: "/" })
    res.cookies.set("user", email, { path: "/" })
    return res
  } catch (e) {
    console.error("LOGIN ERROR:", e)
    return NextResponse.json({ message: "DB Error, cek terminal" }, { status: 500 })
  }
}