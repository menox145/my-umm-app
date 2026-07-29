import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { normalizeRole } from "@/lib/role"
import bcrypt from "bcryptjs"

async function ensureSeedUsers() {
  const count = await prisma.user.count()
  if (count > 0) return

  const password = await bcrypt.hash("123456", 10)

  await prisma.lokasi.upsert({
    where: { id: "lokasi-a" },
    update: {},
    create: { id: "lokasi-a", nama: "Lokasi A" },
  })

  await prisma.user.upsert({
    where: { email: "admin@ayam.com" },
    update: {},
    create: { name: "Admin", email: "admin@ayam.com", password, role: "ADMIN" },
  })

  await prisma.user.upsert({
    where: { email: "pegawai@ayam.com" },
    update: {},
    create: { name: "Budi Pegawai", email: "pegawai@ayam.com", password, role: "KARYAWAN", lokasiId: "lokasi-a" },
  })

  await prisma.user.upsert({
    where: { email: "pengawas@ayam.com" },
    update: {},
    create: { name: "Sari Pengawas", email: "pengawas@ayam.com", password, role: "MANAGER" },
  })
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    await ensureSeedUsers()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ message: "User tidak ditemukan" }, { status: 401 })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return NextResponse.json({ message: "Password salah" }, { status: 401 })

    const userData = {
      id: user.id,
      email: user.email,
      role: normalizeRole(user.role),
      name: user.name,
      lokasiId: (user as any).lokasiId,
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