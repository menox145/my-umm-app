"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import LogoutButton from "./LogoutButton"

interface User {
  role: string
  name: string
  lokasiId?: string | null
}

interface Lokasi {
  id: string
  nama: string
}

interface StockItem {
  id: string
  bahanId: string
  jumlah: number
  bahan: { id: string; nama: string; satuan: string }
  lokasi: { id: string; nama: string }
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [stocks, setStocks] = useState<StockItem[]>([])
  const [lokasis, setLokasis] = useState<Lokasi[]>([])
  const [selectedLokasi, setSelectedLokasi] = useState("")
  const [pegawaiStock, setPegawaiStock] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)

  const checkSession = async () => {
    const res = await fetch("/api/auth/session")
    const data = await res.json()
    if (data.success) setUser(data.user)
  }

  const fetchLokasis = async () => {
    const res = await fetch("/api/lokasi")
    const data = await res.json()
    if (data.success) setLokasis(data.lokasi)
  }

  const fetchStock = async (lokasiId: string) => {
    const res = await fetch(`/api/bahan/stock?lokasiId=${lokasiId}`)
    const data = await res.json()
    if (data.success) setStocks(data.stocks || [])
  }

  useEffect(() => {
    checkSession()
    fetchLokasis()
    setLoading(false)
  }, [])

  useEffect(() => {
    if (selectedLokasi) fetchStock(selectedLokasi)
  }, [selectedLokasi])

  useEffect(() => {
    if (user?.lokasiId) {
      fetch(`/api/bahan/stock?lokasiId=${user.lokasiId}`)
        .then(r => r.json())
        .then(d => { if (d.success) setPegawaiStock(d.stocks || []) })
    }
  }, [user])

  if (loading) {
    return <div className="min-h-screen bg-[#FFF8E7] p-6 flex items-center justify-center"><p className="text-black">Loading...</p></div>
  }

  const isAdmin = user?.role === "ADMIN"
  const isPengawas = user?.role === "PENGAWAS"
  const isPegawai = user?.role === "PEGAWAI"
  const userLokasi = lokasis.find(l => l.id === user?.lokasiId)

  return (
    <div className="min-h-screen bg-[#FFF8E7] p-6 md:p-10 text-black">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-black text-black">DASHBOARD</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-black ${isAdmin ? "bg-[#FF6B00] text-white" : isPengawas ? "bg-[#FFCC00] text-black" : "bg-black text-white"}`}>
            {user?.role}
          </span>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-2 text-xl font-black text-black">
        Hai, {user?.name || "Pengguna"} {userLokasi ? `(${userLokasi.nama})` : ""}!
      </div>

      {/* MENU ADMIN */}
      {isAdmin && (
        <>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-6">
            <Link href="/dashboard/bahan" className="bg-white border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] transition">
              <h2 className="font-black text-2xl text-black">MASTER BAHAN</h2>
              <p className="text-base font-bold text-black mt-1">Kelola data & stock</p>
              <p className="text-5xl mt-3">📦</p>
            </Link>
            <Link href="/dashboard/lokasi" className="bg-white border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] transition">
              <h2 className="font-black text-2xl text-black">KELOLA LOKASI</h2>
              <p className="text-base font-bold text-black mt-1">Atur unit/lokasi</p>
              <p className="text-5xl mt-3">📍</p>
            </Link>
            <Link href="/dashboard/users" className="bg-white border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] transition">
              <h2 className="font-black text-2xl text-black">KELOLA USER</h2>
              <p className="text-base font-bold text-black mt-1">Tambah/edit/hapus</p>
              <p className="text-5xl mt-3">👥</p>
            </Link>
            <Link href="/dashboard/request" className="bg-white border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] transition">
              <h2 className="font-black text-2xl text-black">REQUEST STOK</h2>
              <p className="text-base font-bold text-black mt-1">Lihat permintaan</p>
              <p className="text-5xl mt-3">📋</p>
            </Link>
            <Link href="/dashboard/pemakaian" className="bg-white border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] transition">
              <h2 className="font-black text-2xl text-black">LAPORAN PEMAKAIAN</h2>
              <p className="text-base font-bold text-black mt-1">Lihat pemakaian</p>
              <p className="text-5xl mt-3">📊</p>
            </Link>
          </div>
          <div className="mt-8 bg-[#FF6B00] border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_#000]">
            <h2 className="font-black text-2xl text-white">RIWAYAT PENGAJUAN</h2>
            <p className="text-base font-bold text-white mt-1">Semua riwayat permintaan bahan</p>
            <Link href="/dashboard/riwayat" className="mt-4 inline-block bg-white text-[#FF6B00] px-6 py-3 rounded-full font-black text-base">LIHAT RIWAYAT →</Link>
          </div>
        </>
      )}

      {/* MENU PENGAWAS */}
      {isPengawas && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/request" className="bg-[#FFCC00] border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] transition">
            <h2 className="font-black text-2xl text-black">REQUEST STOK</h2>
            <p className="text-base font-bold text-black mt-1">Ajukan / setujui permintaan</p>
            <p className="text-5xl mt-3">📋</p>
          </Link>
          <Link href="/dashboard/pemakaian" className="bg-white border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] transition">
            <h2 className="font-black text-2xl text-black">LAPORAN PEMAKAIAN</h2>
            <p className="text-base font-bold text-black mt-1">Lihat pemakaian harian</p>
            <p className="text-5xl mt-3">📊</p>
          </Link>
          <Link href="/dashboard/riwayat" className="bg-[#FF6B00] border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] transition">
            <h2 className="font-black text-2xl text-white">RIWAYAT</h2>
            <p className="text-base font-bold text-white mt-1">Lihat riwayat pengajuan</p>
            <p className="text-5xl mt-3">📜</p>
          </Link>
        </div>
      )}

      {/* MENU PEGAWAI */}
      {isPegawai && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard/request" className="block bg-[#FF6B00] border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] transition">
            <h2 className="font-black text-2xl text-white">REQUEST STOK</h2>
            <p className="text-base font-bold text-white mt-1">Ajukan permintaan bahan ke pengawas</p>
          </Link>
          <Link href="/dashboard/pemakaian" className="block bg-[#FFCC00] border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] transition">
            <h2 className="font-black text-2xl text-black">CATAT PEMAKAIAN</h2>
            <p className="text-base font-bold text-black mt-1">Catat pemakaian bahan harian cabang</p>
          </Link>
        </div>
      )}

      {/* LOKASI CARDS - hanya untuk admin/pengawas */}
      {(isAdmin || isPengawas) && lokasis.length > 0 && (
        <div className="mt-10">
          <h3 className="font-black text-2xl mb-4 text-black">LOKASI</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lokasis.map((l) => {
              const isSelected = selectedLokasi === l.id
              return (
                <button
                  key={l.id}
                  onClick={() => setSelectedLokasi(l.id)}
                  className={`text-left border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_#000] transition ${
                    isSelected ? "bg-black text-[#FFCC00]" : "bg-white text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#000]"
                  }`}
                >
                  <h2 className="font-black text-2xl">{l.nama.toUpperCase()}</h2>
                  <p className={`text-base font-bold mt-1 ${isSelected ? "text-[#FFCC00]" : "text-black"}`}>
                    Klik untuk lihat stock
                  </p>
                  <p className="text-5xl mt-3">📍</p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* STOCK UNTUK LOKASI TERPILIH (admin/pengawas) */}
      {(isAdmin || isPengawas) && selectedLokasi && (
        <div className="mt-8">
          <h3 className="font-black text-2xl mb-4 text-black">
            STOCK {lokasis.find(l => l.id === selectedLokasi)?.nama.toUpperCase()}
          </h3>
          {stocks.length === 0 ? (
            <p className="text-xl font-bold text-black">Belum ada stock</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stocks.map((item, index) => (
                <div key={item.id} className={`border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_#000] ${
                  index === 0 ? "bg-white" : index === 1 ? "bg-[#FFCC00]" : "bg-black"
                }`}>
                  <h2 className={`font-black text-2xl ${index === 0 ? "text-black" : index === 1 ? "text-black" : "text-[#FFCC00]"}`}>
                    {item.bahan.nama.toUpperCase()}
                  </h2>
                  <p className={`text-5xl font-black mt-2 ${index === 0 ? "text-black" : index === 1 ? "text-black" : "text-white"}`}>
                    {item.jumlah}
                  </p>
                  <p className={`text-lg font-bold mt-1 ${index === 0 ? "text-black" : index === 1 ? "text-black" : "text-white"}`}>
                    {item.bahan.satuan}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STOCK UNTUK PEGAWAI (lokasi mereka sendiri) */}
      {isPegawai && (
        <div className="mt-10">
          <h3 className="font-black text-2xl mb-4 text-black">STOK SAYA {userLokasi ? `(${userLokasi.nama})` : ""}</h3>
          {!userLokasi ? (
            <p className="text-xl font-bold text-black">Anda belum memiliki lokasi. Hubungi admin.</p>
          ) : pegawaiStock.length === 0 ? (
            <p className="text-xl font-bold text-black">Belum ada stock</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pegawaiStock.map((item, index) => (
                <div key={item.id} className={`border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_#000] ${
                  index === 0 ? "bg-white" : index === 1 ? "bg-[#FFCC00]" : "bg-black"
                }`}>
                  <h2 className={`font-black text-2xl ${index === 0 ? "text-black" : index === 1 ? "text-black" : "text-[#FFCC00]"}`}>
                    {item.bahan.nama.toUpperCase()}
                  </h2>
                  <p className={`text-5xl font-black mt-2 ${index === 0 ? "text-black" : index === 1 ? "text-black" : "text-white"}`}>
                    {item.jumlah}
                  </p>
                  <p className={`text-lg font-bold mt-1 ${index === 0 ? "text-black" : index === 1 ? "text-black" : "text-white"}`}>
                    {item.bahan.satuan}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
