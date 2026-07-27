"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import LogoutButton from "../LogoutButton"

interface Bahan {
  id: string
  nama: string
  satuan: string
}

interface StockItem {
  id: string
  bahanId: string
  jumlah: number
  bahan: { id: string; nama: string; satuan: string }
}

interface PemakaianLog {
  id: string;
  bahanNama: string;
  jumlah: number;
  tanggal: string;
  catatan: string | null;
  bahan: { nama: string; satuan: string };
  lokasi: { nama: string };
}

interface Lokasi {
  id: string;
  nama: string;
}

export default function PemakaianPage() {
  const [user, setUser] = useState<{ role: string; name: string; lokasiId?: string | null } | null>(null)
  const [stocks, setStocks] = useState<StockItem[]>([])
  const [logs, setLogs] = useState<PemakaianLog[]>([])
  const [lokasis, setLokasis] = useState<Lokasi[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Form States
  const [form, setForm] = useState({ bahanId: "", jumlah: 1, tanggal: "", catatan: "" })

  useEffect(() => {
    if (!form.tanggal) {
      setForm(f => ({ ...f, tanggal: new Date().toISOString().split("T")[0] }))
    }
  }, [])
  const [submitting, setSubmitting] = useState(false)

  // Filter States
  const [filterTanggal, setFilterTanggal] = useState("")
  const [filterBahan, setFilterBahan] = useState("")
  const [filterLokasi, setFilterLokasi] = useState("")

  const checkSession = async () => {
    const res = await fetch("/api/auth/session")
    const data = await res.json()
    if (data.success) {
      setUser(data.user)
      return data.user
    }
    return null
  }

  const fetchLokasis = async () => {
    const res = await fetch("/api/lokasi")
    const data = await res.json()
    if (data.success) setLokasis(data.lokasi)
  }

  const fetchStockAndLogs = async (currentUser: any) => {
    setLoading(true)
    try {
      // If user has a location, fetch branch stock
      if (currentUser?.lokasiId) {
        const stockRes = await fetch(`/api/bahan/stock?lokasiId=${currentUser.lokasiId}`)
        const stockData = await stockRes.json()
        if (stockData.success) {
          setStocks(stockData.stocks || [])
        }
      }

      // Fetch logs
      const logsRes = await fetch("/api/pemakaian")
      const logsData = await logsRes.json()
      if (logsData.success) {
        setLogs(logsData.pemakaian || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const init = async () => {
    const u = await checkSession()
    await fetchLokasis()
    await fetchStockAndLogs(u)
  }

  useEffect(() => {
    init()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.bahanId || form.jumlah <= 0) {
      alert("Harap pilih bahan dan masukkan jumlah yang valid.")
      return
    }

    const selectedStock = stocks.find(s => s.bahanId === form.bahanId)
    if (!selectedStock) {
      alert("Stok tidak ditemukan.")
      return
    }

    if (selectedStock.jumlah < form.jumlah) {
      alert(`Stok tidak mencukupi. Stok saat ini: ${selectedStock.jumlah} ${selectedStock.bahan.satuan}`)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/pemakaian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        alert("Pemakaian berhasil dicatat!")
        setForm({ bahanId: "", jumlah: 1, tanggal: new Date().toISOString().split("T")[0], catatan: "" })
        await fetchStockAndLogs(user)
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", { 
      day: "numeric", month: "long", year: "numeric" 
    })
  }

  // Filter Logs
  const filteredLogs = logs.filter(log => {
    if (filterTanggal && log.tanggal.split("T")[0] !== filterTanggal) {
      return false
    }
    if (filterBahan && log.bahanNama !== filterBahan) {
      return false
    }
    if (filterLokasi && log.lokasi.nama !== filterLokasi) {
      return false
    }
    return true
  })

  const resetFilters = () => {
    setFilterTanggal("")
    setFilterBahan("")
    setFilterLokasi("")
  }

  const isAdmin = user?.role === "ADMIN"
  const isPengawas = user?.role === "PENGAWAS"
  const isPegawai = user?.role === "PEGAWAI"

  return (
    <div className="min-h-screen bg-[#FFF8E7] p-6 md:p-10 text-black">
      {/* CSS untuk pencetakan */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            display: block !important;
            margin-bottom: 20px;
          }
          .print-table {
            border: 2px solid black !important;
            border-collapse: collapse !important;
            width: 100% !important;
          }
          .print-table th, .print-table td {
            border: 1px solid black !important;
            padding: 8px !important;
            color: black !important;
          }
          .print-shadow-none {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            background: transparent !important;
          }
        }
      `}} />

      {/* Header Cetak */}
      <div className="hidden print-header text-center border-b-4 border-black pb-4 mb-6">
        <h1 className="text-3xl font-black uppercase tracking-tight">MYUMM FRIED CHICKEN</h1>
        <p className="text-sm font-bold tracking-widest text-[#FF6B00]">LAPORAN PEMAKAIAN BAHAN HARIAN</p>
        <p className="text-xs text-gray-600 mt-1" suppressHydrationWarning>Dicetak pada: {mounted ? new Date().toLocaleString("id-ID") : ""}</p>
      </div>

      <div className="flex justify-between items-center mb-8 no-print">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-black font-black">← DASHBOARD</Link>
          <h1 className="font-black text-3xl">PEMAKAIAN BAHAN</h1>
        </div>
        <LogoutButton />
      </div>

      {isPegawai && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 no-print">
          {/* Form Pencatatan Pemakaian */}
          <div className="md:col-span-1 bg-white border-2 border-black rounded-lg p-6 shadow-[6px_6px_0px_0px_#000]">
            <h2 className="font-black text-xl mb-4 uppercase">CATAT PEMAKAIAN</h2>
            {!user?.lokasiId ? (
              <p className="text-sm font-bold text-red-500">Anda belum terhubung ke lokasi cabang. Hubungi Admin.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="font-black text-xs">PILIH BAHAN DARI STOK</label>
                  <select 
                    value={form.bahanId} 
                    onChange={e => setForm({ ...form, bahanId: e.target.value })}
                    className="w-full mt-1 border-2 border-black rounded-full px-4 py-2.5 font-bold bg-white"
                    required
                  >
                    <option value="">Pilih bahan...</option>
                    {stocks.map(s => (
                      <option key={s.bahanId} value={s.bahanId}>
                        {s.bahan.nama} (Stok: {s.jumlah} {s.bahan.satuan})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-black text-xs">JUMLAH PEMAKAIAN</label>
                  <input 
                    type="number" 
                    min="1"
                    value={form.jumlah} 
                    onChange={e => setForm({ ...form, jumlah: Number(e.target.value) })}
                    className="w-full mt-1 border-2 border-black rounded-full px-4 py-2.5 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-black text-xs">TANGGAL PEMAKAIAN</label>
                  <input 
                    type="date" 
                    value={form.tanggal} 
                    onChange={e => setForm({ ...form, tanggal: e.target.value })}
                    className="w-full mt-1 border-2 border-black rounded-full px-4 py-2.5 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-black text-xs">CATATAN (Opsional)</label>
                  <textarea 
                    value={form.catatan} 
                    onChange={e => setForm({ ...form, catatan: e.target.value })}
                    className="w-full mt-1 border-2 border-black rounded-xl px-4 py-2 font-bold"
                    rows={2}
                    placeholder="Misal: untuk penggorengan siang..."
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submitting || stocks.length === 0} 
                  className="w-full bg-[#FF6B00] text-white py-3 rounded-full font-black hover:bg-black transition border-2 border-black shadow-[4px_4px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1"
                >
                  {submitting ? "MENCATAT..." : "SIMPAN PEMAKAIAN"}
                </button>
              </form>
            )}
          </div>

          {/* Menampilkan Stok Saat Ini */}
          <div className="md:col-span-2 bg-[#FFCC00] border-2 border-black rounded-lg p-6 shadow-[6px_6px_0px_0px_#000]">
            <h2 className="font-black text-xl mb-4 uppercase text-black">STOK CABANG SEKARANG</h2>
            {stocks.length === 0 ? (
              <p className="text-base font-bold text-black">Belum ada stok bahan di cabang ini.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stocks.map(s => (
                  <div key={s.id} className="bg-white border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_#000]">
                    <h3 className="font-black text-base uppercase text-black">{s.bahan.nama}</h3>
                    <p className="text-3xl font-black mt-1 text-[#FF6B00]">{s.jumlah}</p>
                    <p className="text-xs font-bold text-gray-600">{s.bahan.satuan}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FILTER PANEL */}
      <div className="mb-8 bg-white border-2 border-black rounded-lg p-6 shadow-[6px_6px_0px_0px_#000] no-print">
        <h2 className="font-black text-xl mb-4">🔍 FILTER & CETAK RIWAYAT</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-black mb-1">TANGGAL PEMAKAIAN</label>
            <input 
              type="date" 
              value={filterTanggal}
              onChange={e => setFilterTanggal(e.target.value)}
              className="w-full border-2 border-black rounded-full px-4 py-2 font-bold bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-black mb-1">BAHAN</label>
            <select 
              value={filterBahan}
              onChange={e => setFilterBahan(e.target.value)}
              className="w-full border-2 border-black rounded-full px-4 py-2.5 font-bold bg-white outline-none"
            >
              <option value="">Semua Bahan</option>
              {Array.from(new Set(logs.map(l => l.bahanNama))).map(nama => (
                <option key={nama} value={nama}>{nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black mb-1">LOKASI CABANG</label>
            <select 
              value={filterLokasi}
              disabled={isPegawai}
              onChange={e => setFilterLokasi(e.target.value)}
              className="w-full border-2 border-black rounded-full px-4 py-2.5 font-bold bg-white outline-none disabled:opacity-50"
            >
              {isPegawai ? (
                <option value="">{stocks[0]?.bahan ? "Cabang Anda" : "Lokasi Saya"}</option>
              ) : (
                <>
                  <option value="">Semua Cabang</option>
                  {lokasis.map(l => (
                    <option key={l.id} value={l.nama}>{l.nama.toUpperCase()}</option>
                  ))}
                </>
              )}
            </select>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={resetFilters} 
              className="flex-1 bg-black text-white py-2.5 rounded-full font-black text-sm uppercase transition border-2 border-black"
            >
              Reset
            </button>
            <button 
              onClick={() => window.print()}
              disabled={filteredLogs.length === 0}
              className="flex-1 bg-[#FF6B00] text-white py-2.5 rounded-full font-black text-sm uppercase border-2 border-black shadow-[2px_2px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🖨️ Cetak
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Riwayat Pemakaian */}
      <div className="bg-white border-2 border-black rounded-lg p-6 shadow-[6px_6px_0px_0px_#000] print-shadow-none">
        <h2 className="font-black text-xl mb-4 no-print">RIWAYAT PEMAKAIAN BAHAN</h2>
        {loading ? (
          <p className="text-center py-10 no-print">Loading...</p>
        ) : filteredLogs.length === 0 ? (
          <p className="text-center py-10 text-gray-700">Belum ada riwayat pemakaian bahan</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full print-table">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-3 px-4 font-black text-sm">TANGGAL PEMAKAIAN</th>
                  <th className="text-left py-3 px-4 font-black text-sm">NAMA BAHAN</th>
                  <th className="text-left py-3 px-4 font-black text-sm">JUMLAH TERPAKAI</th>
                  <th className="text-left py-3 px-4 font-black text-sm">LOKASI CABANG</th>
                  <th className="text-left py-3 px-4 font-black text-sm">CATATAN</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-300">
                    <td className="py-3 px-4 text-sm font-bold">{formatDate(log.tanggal)}</td>
                    <td className="py-3 px-4 font-black text-[#FF6B00]">{log.bahanNama}</td>
                    <td className="py-3 px-4 font-bold">{log.jumlah} {log.bahan.satuan}</td>
                    <td className="py-3 px-4 text-sm font-bold">{log.lokasi.nama.toUpperCase()}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 italic">{log.catatan || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
