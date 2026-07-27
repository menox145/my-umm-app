"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import LogoutButton from "../LogoutButton"

interface Lokasi {
  id: string
  nama: string
  createdAt: string
}

export default function LokasiPage() {
  const [lokasis, setLokasis] = useState<Lokasi[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [nama, setNama] = useState("")
  const [userRole, setUserRole] = useState("")

  const checkRole = async () => {
    const res = await fetch("/api/auth/session")
    const data = await res.json()
    if (data.success) setUserRole(data.user.role)
  }

  const fetchLokasis = async () => {
    setLoading(true)
    const res = await fetch("/api/lokasi")
    const data = await res.json()
    if (data.success) setLokasis(data.lokasi)
    setLoading(false)
  }

  useEffect(() => {
    fetchLokasis()
    checkRole()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/lokasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama }),
    })
    const data = await res.json()
    if (data.success) {
      setShowModal(false)
      setNama("")
      fetchLokasis()
    } else {
      alert(data.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus lokasi ini?")) return
    const res = await fetch(`/api/lokasi?id=${id}`, { method: "DELETE" })
    const data = await res.json()
    if (data.success) fetchLokasis()
  }

  if (userRole !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#FFF8E7] p-6 md:p-10 flex items-center justify-center text-black">
        <div className="text-center">
          <h1 className="font-black text-3xl">AKSES DITOLAK</h1>
          <p className="mt-2 text-gray-700">Hanya admin yang dapat mengakses halaman ini</p>
          <Link href="/dashboard" className="mt-4 inline-block bg-[#FF6B00] text-white px-6 py-3 rounded-full font-black">KEMBALI</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8E7] p-6 md:p-10 text-black">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-black font-black">← DASHBOARD</Link>
          <h1 className="font-black text-3xl">KELOLA LOKASI</h1>
        </div>
        <LogoutButton />
      </div>

      <div className="bg-white border-2 border-black rounded-lg shadow-[6px_6px_0px_0px_#000] p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="font-bold text-gray-700">Unit / Lokasi</p>
          <button onClick={() => { setNama(""); setShowModal(true) }} className="bg-[#FF6B00] text-white px-5 py-2.5 rounded-full font-black text-sm">+ TAMBAH LOKASI</button>
        </div>

        {loading ? (
          <p className="text-center py-10">Loading...</p>
        ) : lokasis.length === 0 ? (
          <p className="text-center py-10 text-gray-700">Belum ada lokasi. Klik &quot;+ TAMBAH LOKASI&quot; untuk memulai.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-3 px-4 font-black text-sm">NAMA LOKASI</th>
                  <th className="text-left py-3 px-4 font-black text-sm">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {lokasis.map((lokasi) => (
                  <tr key={lokasi.id} className="border-b border-gray-300">
                    <td className="py-3 px-4 font-bold">{lokasi.nama}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleDelete(lokasi.id)} className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black">HAPUS</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white border-2 border-black rounded-lg p-6 w-full max-w-md shadow-[8px_8px_0px_0px_#000]">
            <h2 className="font-black text-xl mb-4">TAMBAH LOKASI</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-black text-sm">NAMA LOKASI</label>
                <input value={nama} onChange={e => setNama(e.target.value)} className="w-full mt-1 border-2 border-black rounded-full px-4 py-2 font-bold" placeholder="Contoh: Lokasi A, Unit 1, Dapur Utama" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-[#FF6B00] text-white py-3 rounded-full font-black">TAMBAH</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-black text-white py-3 rounded-full font-black">BATAL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
