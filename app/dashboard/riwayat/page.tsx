"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import LogoutButton from "../LogoutButton"

interface Request {
  id: string
  bahanNama: string
  jumlah: number
  jumlahDisetujui: number | null
  status: string
  userName: string
  catatan: string | null
  respon: string | null
  createdAt: string
}

export default function RiwayatPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  const fetchData = async () => {
    setLoading(true)
    const requestRes = await fetch("/api/request")
    const requestData = await requestRes.json()
    
    if (requestData.success) setRequests(requestData.requests)
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", { 
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" 
    })
  }

  const filteredRequests = requests.filter(req => {
    if (filter === "all") return true
    return req.status === filter
  })

  return (
    <div className="min-h-screen bg-[#FFF8E7] p-6 md:p-10 text-black">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-black font-black">← DASHBOARD</Link>
          <h1 className="font-black text-3xl">RIWAYAT REQUEST</h1>
        </div>
        <LogoutButton />
      </div>

      {/* FILTER */}
      <div className="mb-6 flex gap-2">
        <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-full font-black text-sm ${filter === "all" ? "bg-black text-white" : "bg-white border-2 border-black"}`}>ALL</button>
        <button onClick={() => setFilter("PENDING")} className={`px-4 py-2 rounded-full font-black text-sm ${filter === "PENDING" ? "bg-yellow-500 text-black" : "bg-white border-2 border-black"}`}>PENDING</button>
        <button onClick={() => setFilter("APPROVED")} className={`px-4 py-2 rounded-full font-black text-sm ${filter === "APPROVED" ? "bg-green-500 text-white" : "bg-white border-2 border-black"}`}>APPROVED</button>
        <button onClick={() => setFilter("REJECTED")} className={`px-4 py-2 rounded-full font-black text-sm ${filter === "REJECTED" ? "bg-red-500 text-white" : "bg-white border-2 border-black"}`}>REJECTED</button>
      </div>

      {/* TABEL */}
      <div className="bg-white border-2 border-black rounded-lg p-6 shadow-[6px_6px_0px_0px_#000]">
        {loading ? (
          <p className="text-center py-10">Loading...</p>
        ) : filteredRequests.length === 0 ? (
          <p className="text-center py-10 text-gray-700">Tidak ada request</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-3 px-4 font-black text-sm">TANGGAL</th>
                    <th className="text-left py-3 px-4 font-black text-sm">BAHAN</th>
                    <th className="text-left py-3 px-4 font-black text-sm">DIMINTA</th>
                    <th className="text-left py-3 px-4 font-black text-sm">DISETUJUI</th>
                    <th className="text-left py-3 px-4 font-black text-sm">PENGAJU</th>
                    <th className="text-left py-3 px-4 font-black text-sm">CATATAN</th>
                    <th className="text-left py-3 px-4 font-black text-sm">RESPON</th>
                    <th className="text-left py-3 px-4 font-black text-sm">STATUS</th>
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
                    <td className="py-3 px-4 text-sm text-gray-700">{req.catatan || "-"}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{req.respon || "-"}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        req.status === "APPROVED" ? "bg-green-500 text-white" : 
                        req.status === "REJECTED" ? "bg-red-500 text-white" : 
                        "bg-yellow-500 text-black"
                      }`}>
                        {req.status}
                      </span>
                    </td>
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