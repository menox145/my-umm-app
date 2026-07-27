"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import LogoutButton from "../LogoutButton"

interface Bahan {
  id: string
  nama: string
  satuan: string
}

interface Request {
  id: string
  bahanId: string
  bahanNama: string
  jumlah: number
  jumlahDisetujui: number | null
  status: string
  userName: string
  lokasi: { id: string; nama: string } | null
  catatan: string | null
  respon: string | null
  createdAt: string
}

export default function RequestPage() {
  const [bahans, setBahans] = useState<Bahan[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const [approveData, setApproveData] = useState<{ id: string; status: string; bahanNama: string; jumlah: number; satuan: string }>({ id: "", status: "", bahanNama: "", jumlah: 0, satuan: "" })
  const [approveJumlah, setApproveJumlah] = useState(0)
  const [approveRespon, setApproveRespon] = useState("")
  const [form, setForm] = useState({ bahanId: "", bahanNama: "", jumlah: 1, catatan: "" })
  const [userRole, setUserRole] = useState<string>("")
  const [userLokasiNama, setUserLokasiNama] = useState("-")

  // Filter States
  const [filterTanggal, setFilterTanggal] = useState("")
  const [filterBahan, setFilterBahan] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  const fetchData = async () => {
    setLoading(true)
    const [bahanRes, requestRes, sessionRes, lokasiRes] = await Promise.all([
      fetch("/api/bahan"),
      fetch("/api/request"),
      fetch("/api/auth/session"),
      fetch("/api/lokasi")
    ])
    
    const bahanData = await bahanRes.json()
    const requestData = await requestRes.json()
    const sessionData = await sessionRes.json()
    const lokasiData = await lokasiRes.json()
    
    if (bahanData.success) setBahans(bahanData.bahan)
    if (requestData.success) setRequests(requestData.requests)
    if (sessionData.success) {
      setUserRole(sessionData.user.role)
      const lokasi = lokasiData.lokasi?.find((l: any) => l.id === sessionData.user.lokasiId)
      if (lokasi) setUserLokasiNama(lokasi.nama)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    
    if (data.success) {
      setShowModal(false)
      setForm({ bahanId: "", bahanNama: "", jumlah: 1, catatan: "" })
      fetchData()
      alert("Request berhasil dikirim!")
    } else {
      alert(data.message)
    }
  }

  const openApprove = (req: Request, status: string) => {
    const bahan = bahans.find(b => b.id === req.bahanId)
    setApproveData({ id: req.id, status, bahanNama: req.bahanNama, jumlah: req.jumlah, satuan: bahan?.satuan || "" })
    setApproveJumlah(req.jumlah)
    setApproveRespon("")
    setShowApproveModal(true)
  }

  const handleApprove = async () => {
    const res = await fetch(`/api/request?id=${approveData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: approveData.status, jumlah: approveJumlah, respon: approveRespon || null }),
    })
    const data = await res.json()
    if (data.success) {
      setShowApproveModal(false)
      fetchData()
    } else {
      alert(data.message)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", { 
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" 
    })
  }

  // Filter Logic
  const filteredRequests = requests.filter(req => {
    if (filterTanggal) {
      const reqDateStr = new Date(req.createdAt).toISOString().split("T")[0];
      if (reqDateStr !== filterTanggal) return false;
    }
    if (filterBahan && req.bahanNama !== filterBahan) {
      return false;
    }
    if (filterStatus && req.status !== filterStatus) {
      return false;
    }
    return true;
  })

  const resetFilters = () => {
    setFilterTanggal("")
    setFilterBahan("")
    setFilterStatus("")
  }

  const isAdmin = userRole === "ADMIN"
  const isPengawas = userRole === "PENGAWAS"
  const canApprove = isAdmin || isPengawas

  return (
    <div className="min-h-screen bg-[#FFF8E7] p-6 md:p-10 text-black">
      {/* Stylesheet untuk print */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 20mm 15mm; }
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .print-header { display: block !important; margin-bottom: 12px; }
          .print-footer { display: block !important; position: fixed; bottom: 0; left: 15mm; right: 15mm; background: white; padding-top: 8px; }
          .print-content { padding-bottom: 100px; }
          .print-table { border: 2px solid black !important; border-collapse: collapse !important; width: 100% !important; }
          .print-table th, .print-table td { border: 1px solid black !important; padding: 6px !important; color: black !important; font-size: 11px !important; }
          .print-table th { background: #f5f5f5 !important; }
          .print-hide { display: none !important; }
          .print-shadow-none { box-shadow: none !important; border: none !important; padding: 0 !important; background: transparent !important; }
        }
      `}} />

      {/* Header Cetak (Hanya tampil saat di-print) */}
      <div className="hidden print-header">
        <div className="text-center border-b-4 border-black pb-3 mb-4">
          <h1 className="text-2xl font-black uppercase tracking-tight">MYUMM FRIED CHICKEN</h1>
          <p className="text-sm font-bold tracking-widest text-[#FF6B00]">LAPORAN PERMINTAAN STOK BAHAN</p>
        </div>
        <div className="flex justify-between items-center text-xs font-bold mb-4 px-1">
          <span>Lokasi: <span className="text-[#FF6B00]">{userLokasiNama}</span></span>
          <span suppressHydrationWarning>Tgl Cetak: {mounted ? new Date().toLocaleString("id-ID") : ""}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8 no-print">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-black font-black">← DASHBOARD</Link>
          <h1 className="font-black text-3xl">REQUEST STOK</h1>
        </div>
        <LogoutButton />
      </div>

      {isAdmin && (
        <div className="mb-6 bg-[#FF6B00] text-white px-4 py-2 rounded-lg font-bold text-sm no-print">
         Sebagai ADMIN, Anda dapat menyetujui atau menolak request
        </div>
      )}

      {isPengawas && (
        <div className="mb-6 bg-[#FFCC00] text-black px-4 py-2 rounded-lg font-bold text-sm no-print">
         Sebagai PENGAWAS, Anda dapat menyetujui atau menolak request
        </div>
      )}

      {!isAdmin && (
        <div className="mb-8 bg-white border-2 border-black rounded-lg p-6 shadow-[6px_6px_0px_0px_#000] no-print">
          <h2 className="font-black text-xl mb-4">BUAT REQUEST</h2>
          <button onClick={() => setShowModal(true)} className="bg-[#FF6B00] text-white px-6 py-3 rounded-full font-black">+ BUAT REQUEST</button>
        </div>
      )}

      {/* FILTER PANEL */}
      <div className="mb-8 bg-white border-2 border-black rounded-lg p-6 shadow-[6px_6px_0px_0px_#000] no-print">
        <h2 className="font-black text-xl mb-4">🔍 FILTER & CETAK</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-black mb-1">TANGGAL</label>
            <input 
              type="date" 
              value={filterTanggal}
              onChange={e => setFilterTanggal(e.target.value)}
              className="w-full border-2 border-black rounded-full px-4 py-2 font-bold bg-white text-black outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-black mb-1">BAHAN</label>
            <select 
              value={filterBahan}
              onChange={e => setFilterBahan(e.target.value)}
              className="w-full border-2 border-black rounded-full px-4 py-2 font-bold bg-white text-black outline-none"
            >
              <option value="">Semua Bahan</option>
              {Array.from(new Set(requests.map(r => r.bahanNama))).map(nama => (
                <option key={nama} value={nama}>{nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black mb-1">STATUS</label>
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full border-2 border-black rounded-full px-4 py-2 font-bold bg-white text-black outline-none"
            >
              <option value="">Semua Status</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
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
              disabled={filteredRequests.length === 0}
              className="flex-1 bg-[#FF6B00] text-white py-2.5 rounded-full font-black text-sm uppercase border-2 border-black shadow-[2px_2px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🖨️ Cetak
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-black rounded-lg p-6 shadow-[6px_6px_0px_0px_#000] print-shadow-none print-content">
        <h2 className="font-black text-xl mb-4 no-print">DAFTAR REQUEST</h2>
        
        {loading ? (
          <p className="text-center py-10 no-print">Loading...</p>
        ) : filteredRequests.length === 0 ? (
          <p className="text-center py-10 text-gray-700">Tidak ada request yang cocok dengan filter</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full print-table">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-3 px-4 font-black text-sm">TANGGAL</th>
                  <th className="text-left py-3 px-4 font-black text-sm">BAHAN</th>
                  <th className="text-left py-3 px-4 font-black text-sm">DIMINTA</th>
                  <th className="text-left py-3 px-4 font-black text-sm">DISETUJUI</th>
                  <th className="text-left py-3 px-4 font-black text-sm">PENGAJU</th>
                  <th className="text-left py-3 px-4 font-black text-sm">LOKASI</th>
                  <th className="text-left py-3 px-4 font-black text-sm">STATUS</th>
                  <th className="text-left py-3 px-4 font-black text-sm print-hide">RESPON</th>
                  {canApprove && <th className="text-left py-3 px-4 font-black text-sm no-print">AKSI</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="border-b border-gray-300">
                    <td className="py-3 px-4 text-sm">{formatDate(req.createdAt)}</td>
                    <td className="py-3 px-4 font-bold">{req.bahanNama}</td>
                    <td className="py-3 px-4">{req.jumlah}</td>
                    <td className="py-3 px-4 font-bold">
                      {req.status === "APPROVED" ? (req.jumlahDisetujui !== null ? req.jumlahDisetujui : req.jumlah) : req.status === "REJECTED" ? 0 : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm">{req.userName}</td>
                    <td className="py-3 px-4 text-sm font-bold">{req.lokasi?.nama || "-"}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        req.status === "APPROVED" ? "bg-green-500 text-white" : 
                        req.status === "REJECTED" ? "bg-red-500 text-white" : 
                        "bg-yellow-500 text-black"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 print-hide">{req.respon || "-"}</td>
                    {canApprove && (
                      <td className="py-3 px-4 no-print">
                        {req.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button onClick={() => openApprove(req, "APPROVED")} className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black">✓</button>
                            <button onClick={() => openApprove(req, "REJECTED")} className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black">✗</button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Cetak (TTD) */}
      <div className="hidden print-footer print-only mt-8 pt-4 border-t-2 border-black">
        <div className="flex justify-between px-4 text-sm">
          <div className="text-center">
            <p className="font-bold mb-8">Pemohon,</p>
            <p className="font-black underline mt-10">_________________________</p>
            <p className="text-xs text-gray-600 mt-1">Nama & Tanda Tangan</p>
          </div>
          <div className="text-center">
            <p className="font-bold mb-8">Pengawas,</p>
            <p className="font-black underline mt-10">_________________________</p>
            <p className="text-xs text-gray-600 mt-1">Nama & Tanda Tangan</p>
          </div>
        </div>
      </div>

      {/* MODAL BUAT REQUEST */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6 no-print">
          <div className="bg-white border-2 border-black rounded-lg p-6 w-full max-w-md shadow-[8px_8px_0px_0px_#000]">
            <h2 className="font-black text-xl mb-4">BUAT REQUEST</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-black text-sm">PILIH BAHAN</label>
                <select 
                  value={form.bahanId} 
                  onChange={e => {
                    const selected = bahans.find(b => b.id === e.target.value)
                    setForm({ ...form, bahanId: e.target.value, bahanNama: selected?.nama || "" })
                  }}
                  className="w-full mt-1 border-2 border-black rounded-full px-4 py-2 font-bold"
                  required
                >
                  <option value="">Pilih bahan...</option>
                  {bahans.map(b => (
                    <option key={b.id} value={b.id}>{b.nama} ({b.satuan})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-black text-sm">JUMLAH</label>
                <input 
                  type="number" 
                  min="1"
                  value={form.jumlah} 
                  onChange={e => setForm({ ...form, jumlah: Number(e.target.value) })} 
                  className="w-full mt-1 border-2 border-black rounded-full px-4 py-2 font-bold" 
                  required 
                />
              </div>
              <div>
                <label className="font-black text-sm">CATATAN (Opsional)</label>
                <textarea 
                  value={form.catatan} 
                  onChange={e => setForm({ ...form, catatan: e.target.value })} 
                  className="w-full mt-1 border-2 border-black rounded-full px-4 py-2 font-bold" 
                  rows={2}
                  placeholder="Tambahkan catatan..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-[#FF6B00] text-white py-3 rounded-full font-black">KIRIM</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-black text-white py-3 rounded-full font-black">BATAL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL APPROVE / REJECT */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6 no-print">
          <div className="bg-white border-2 border-black rounded-lg p-6 w-full max-w-md shadow-[8px_8px_0px_0px_#000]">
            <h2 className="font-black text-xl mb-4">{approveData.status === "APPROVED" ? "SETUJUI" : "TOLAK"} REQUEST</h2>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-bold">{approveData.bahanNama}</p>
              <p className="text-sm text-gray-700">Diminta: <span className="font-black">{approveData.jumlah} {approveData.satuan}</span></p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-black text-sm">JUMLAH DISETUJUI</label>
                <input 
                  type="number" min="0"
                  value={approveJumlah} 
                  onChange={e => setApproveJumlah(Number(e.target.value))} 
                  className="w-full mt-1 border-2 border-black rounded-full px-4 py-2 font-bold"
                  disabled={approveData.status === "REJECTED"}
                />
              </div>
              <div>
                <label className="font-black text-sm">RESPON / KETERANGAN</label>
                <textarea 
                  value={approveRespon} 
                  onChange={e => setApproveRespon(e.target.value)} 
                  className="w-full mt-1 border-2 border-black rounded-full px-4 py-2 font-bold" 
                  rows={2}
                  placeholder={approveData.status === "APPROVED" ? "Contoh: Stock terbatas, disetujui 5 saja..." : "Alasan penolakan..."}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleApprove} className={`flex-1 py-3 rounded-full font-black text-white ${approveData.status === "APPROVED" ? "bg-green-500" : "bg-red-500"}`}>
                  {approveData.status === "APPROVED" ? "SETUJUI" : "TOLAK"}
                </button>
                <button onClick={() => setShowApproveModal(false)} className="flex-1 bg-black text-white py-3 rounded-full font-black">BATAL</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
