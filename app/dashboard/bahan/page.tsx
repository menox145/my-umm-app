"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import LogoutButton from "../LogoutButton"

interface Bahan {
  id: string
  nama: string
  satuan: string
  harga: number
  keterangan: string | null
  createdAt: string
}

interface Lokasi {
  id: string
  nama: string
}

interface StockItem {
  id: string
  bahanId: string
  lokasiId: string
  jumlah: number
}

export default function BahanPage() {
  const [bahans, setBahans] = useState<Bahan[]>([])
  const [lokasis, setLokasis] = useState<Lokasi[]>([])
  const [stocks, setStocks] = useState<StockItem[]>([])
  const [selectedLokasi, setSelectedLokasi] = useState("")
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [stockForm, setStockForm] = useState({ bahanId: "", bahanNama: "", jumlah: 0 })
  const [form, setForm] = useState({ nama: "", satuan: "unit", harga: 0, keterangan: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>("")

  const checkRole = async () => {
    const res = await fetch("/api/auth/session")
    const data = await res.json()
    if (data.success) setUserRole(data.user.role)
  }

  const fetchBahans = async () => {
    setLoading(true)
    const res = await fetch("/api/bahan")
    const data = await res.json()
    if (data.success) setBahans(data.bahan)
    setLoading(false)
  }

  const fetchLokasis = async () => {
    const res = await fetch("/api/lokasi")
    const data = await res.json()
    if (data.success) {
      setLokasis(data.lokasi)
      if (data.lokasi.length > 0 && !selectedLokasi) setSelectedLokasi(data.lokasi[0].id)
    }
  }

  const fetchStocks = async (lokasiId: string) => {
    if (!lokasiId) return
    const res = await fetch(`/api/stock?lokasiId=${lokasiId}`)
    const data = await res.json()
    if (data.success) setStocks(data.stocks)
  }

  useEffect(() => {
    fetchBahans()
    checkRole()
    fetchLokasis()
  }, [])

  useEffect(() => {
    if (selectedLokasi) fetchStocks(selectedLokasi)
  }, [selectedLokasi])

  const getStock = (bahanId: string) => {
    const s = stocks.find(s => s.bahanId === bahanId)
    return s?.jumlah || 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingId ? `/api/bahan?id=${editingId}` : "/api/bahan"
    const method = editingId ? "PUT" : "POST"
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingId ? { ...form, id: editingId } : form),
    })
    const data = await res.json()
    
    if (data.success) {
      setShowModal(false)
      setForm({ nama: "", satuan: "unit", harga: 0, keterangan: "" })
      setEditingId(null)
      fetchBahans()
    } else {
      alert(data.message)
    }
  }

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bahanId: stockForm.bahanId, lokasiId: selectedLokasi, jumlah: stockForm.jumlah }),
    })
    const data = await res.json()
    if (data.success) {
      setShowStockModal(false)
      fetchStocks(selectedLokasi)
    } else {
      alert(data.message)
    }
  }

  const handleEdit = (bahan: Bahan) => {
    setForm({ nama: bahan.nama, satuan: bahan.satuan, harga: bahan.harga, keterangan: bahan.keterangan || "" })
    setEditingId(bahan.id)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus bahan ini?")) return
    const res = await fetch(`/api/bahan?id=${id}`, { method: "DELETE" })
    const data = await res.json()
    if (data.success) fetchBahans()
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(angka)
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
          <h1 className="font-black text-3xl">MASTER BAHAN</h1>
        </div>
        <LogoutButton />
      </div>

      <div className="bg-white border-2 border-black rounded-lg shadow-[6px_6px_0px_0px_#000] p-6">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <p className="font-bold text-gray-700">Data Bahan Dasar</p>
            <select value={selectedLokasi} onChange={e => setSelectedLokasi(e.target.value)} className="border-2 border-black rounded-full px-4 py-2 font-bold text-sm">
              <option value="">Pilih Lokasi...</option>
              {lokasis.map(l => <option key={l.id} value={l.id}>{l.nama}</option>)}
            </select>
          </div>
          <button onClick={() => { setForm({ nama: "", satuan: "unit", harga: 0, keterangan: "" }); setEditingId(null); setShowModal(true) }} className="bg-[#FF6B00] text-white px-5 py-2.5 rounded-full font-black text-sm">+ TAMBAH BAHAN</button>
        </div>

        {loading ? (
          <p className="text-center py-10">Loading...</p>
        ) : bahans.length === 0 ? (
          <p className="text-center py-10 text-gray-700">Belum ada data bahan. Klik &quot;+ TAMBAH BAHAN&quot; untuk memulai.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-3 px-4 font-black text-sm">NAMA BAHAN</th>
                  <th className="text-left py-3 px-4 font-black text-sm">STOCK {selectedLokasi ? `(${lokasis.find(l => l.id === selectedLokasi)?.nama || ""})` : ""}</th>
                  <th className="text-left py-3 px-4 font-black text-sm">HARGA</th>
                  <th className="text-left py-3 px-4 font-black text-sm">KETERANGAN</th>
                  <th className="text-left py-3 px-4 font-black text-sm">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {bahans.map((bahan) => (
                  <tr key={bahan.id} className="border-b border-gray-300">
                    <td className="py-3 px-4 font-bold">{bahan.nama}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${getStock(bahan.id) <= 0 ? "bg-red-500 text-white" : getStock(bahan.id) <= 5 ? "bg-[#FFCC00] text-black" : "bg-black text-white"}`}>
                          {getStock(bahan.id)} {bahan.satuan}
                        </span>
                        {selectedLokasi && (
                          <button onClick={() => { setStockForm({ bahanId: bahan.id, bahanNama: bahan.nama, jumlah: getStock(bahan.id) }); setShowStockModal(true) }} className="bg-black text-white w-6 h-6 rounded-full text-xs font-black leading-none">S</button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold">{formatRupiah(bahan.harga)}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{bahan.keterangan || "-"}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(bahan)} className="bg-black text-white px-3 py-1 rounded-full text-xs font-black">EDIT</button>
                        <button onClick={() => handleDelete(bahan.id)} className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black">HAPUS</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH/EDIT BAHAN */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white border-2 border-black rounded-lg p-6 w-full max-w-md shadow-[8px_8px_0px_0px_#000]">
            <h2 className="font-black text-xl mb-4">{editingId ? "EDIT BAHAN" : "TAMBAH BAHAN"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-black text-sm">NAMA BAHAN</label>
                <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} className="w-full mt-1 border-2 border-black rounded-full px-4 py-2 font-bold" placeholder="Contoh: Ayam, Tepung, Minyak" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-black text-sm">SATUAN</label>
                  <select value={form.satuan} onChange={e => setForm({ ...form, satuan: e.target.value })} className="w-full mt-1 border-2 border-black rounded-full px-4 py-2 font-bold">
                    <option value="unit">Unit</option>
                    <option value="kg">Kg</option>
                    <option value="liter">Liter</option>
                    <option value="pcs">Pcs</option>
                    <option value="zak">Zak</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-black text-sm">HARGA (Rp)</label>
                <input type="number" value={form.harga} onChange={e => setForm({ ...form, harga: Number(e.target.value) })} className="w-full mt-1 border-2 border-black rounded-full px-4 py-2 font-bold" required />
              </div>
              <div>
                <label className="font-black text-sm">KETERANGAN</label>
                <textarea value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} className="w-full mt-1 border-2 border-black rounded-full px-4 py-2 font-bold" placeholder="Opsional..." rows={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-[#FF6B00] text-white py-3 rounded-full font-black">{editingId ? "SIMPAN" : "TAMBAH"}</button>
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null) }} className="flex-1 bg-black text-white py-3 rounded-full font-black">BATAL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SET STOCK PER LOKASI */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white border-2 border-black rounded-lg p-6 w-full max-w-sm shadow-[8px_8px_0px_0px_#000]">
            <h2 className="font-black text-xl mb-4">SET STOCK</h2>
            <p className="font-bold mb-1">{stockForm.bahanNama}</p>
            <p className="text-sm text-gray-700 mb-4">{lokasis.find(l => l.id === selectedLokasi)?.nama}</p>
            <form onSubmit={handleStockSubmit} className="space-y-4">
              <div>
                <label className="font-black text-sm">JUMLAH</label>
                <input type="number" value={stockForm.jumlah} onChange={e => setStockForm({ ...stockForm, jumlah: Number(e.target.value) })} className="w-full mt-1 border-2 border-black rounded-full px-4 py-2 font-bold" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-[#FF6B00] text-white py-3 rounded-full font-black">SIMPAN</button>
                <button type="button" onClick={() => setShowStockModal(false)} className="flex-1 bg-black text-white py-3 rounded-full font-black">BATAL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
