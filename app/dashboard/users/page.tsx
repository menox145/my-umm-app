"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import LogoutButton from "../LogoutButton"

interface User {
  id: string
  name: string
  email: string
  role: string
  lokasiId: string | null
  createdAt: string
}

interface Lokasi {
  id: string
  nama: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "PEGAWAI", lokasiId: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>("")
  const [lokasis, setLokasis] = useState<Lokasi[]>([])

  const checkRole = async () => {
    const res = await fetch("/api/auth/session")
    const data = await res.json()
    if (data.success) setUserRole(data.user.role)
  }

  const fetchUsers = async () => {
    setLoading(true)
    const res = await fetch("/api/users")
    const data = await res.json()
    if (data.success) setUsers(data.users)
    setLoading(false)
  }

  const fetchLokasis = async () => {
    const res = await fetch("/api/lokasi")
    const data = await res.json()
    if (data.success) setLokasis(data.lokasi)
  }

  useEffect(() => {
    fetchUsers()
    checkRole()
    fetchLokasis()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingId ? `/api/users/${editingId}` : "/api/users"
    const method = editingId ? "PUT" : "POST"
    
    const body = { ...form, lokasiId: form.lokasiId || null }
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    
    if (data.success) {
      setShowModal(false)
      setForm({ name: "", email: "", password: "", role: "PEGAWAI", lokasiId: "" })
      setEditingId(null)
      fetchUsers()
    } else {
      alert(data.message)
    }
  }

  const handleEdit = (user: User) => {
    setForm({ name: user.name, email: user.email, password: "", role: user.role, lokasiId: user.lokasiId || "" })
    setEditingId(user.id)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus user ini?")) return
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" })
    const data = await res.json()
    if (data.success) fetchUsers()
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
          <h1 className="font-black text-3xl">KELOLA USER</h1>
        </div>
        <LogoutButton />
      </div>

      <div className="bg-white border-2 border-black rounded-lg shadow-[6px_6px_0px_0px_#000] p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="font-bold text-gray-700">Master Data User</p>
          <button onClick={() => { setForm({ name: "", email: "", password: "", role: "PEGAWAI", lokasiId: "" }); setEditingId(null); setShowModal(true) }} className="bg-[#FF6B00] text-white px-5 py-2.5 rounded-full font-black text-sm">+ TAMBAH USER</button>
        </div>

        {loading ? (
          <p className="text-center py-10">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-3 px-4 font-black text-sm">NAMA</th>
                    <th className="text-left py-3 px-4 font-black text-sm">EMAIL</th>
                    <th className="text-left py-3 px-4 font-black text-sm">ROLE</th>
                    <th className="text-left py-3 px-4 font-black text-sm">LOKASI</th>
                    <th className="text-left py-3 px-4 font-black text-sm">AKSI</th>
                  </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const userLokasi = lokasis.find(l => l.id === user.lokasiId)
                  return (
                  <tr key={user.id} className="border-b border-gray-300">
                    <td className="py-3 px-4 font-bold">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${user.role === "ADMIN" ? "bg-[#FF6B00] text-white" : user.role === "PENGAWAS" ? "bg-[#FFCC00] text-black" : "bg-black text-white"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{userLokasi?.nama || "-"}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(user)} className="bg-black text-white px-3 py-1 rounded-full text-xs font-black">EDIT</button>
                        <button onClick={() => handleDelete(user.id)} className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black">HAPUS</button>
                      </div>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white border-2 border-black rounded-lg p-6 w-full max-w-md shadow-[8px_8px_0px_0px_#000]">
            <h2 className="font-black text-xl mb-4">{editingId ? "EDIT USER" : "TAMBAH USER"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-black text-sm">NAMA</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mt-1 border-2 border-black rounded-full px-4 py-2 font-bold" required />
              </div>
              <div>
                <label className="font-black text-sm">EMAIL</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full mt-1 border-2 border-black rounded-full px-4 py-2 font-bold" required />
              </div>
              <div>
                <label className="font-black text-sm">PASSWORD {editingId && "(opsional)"}</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full mt-1 border-2 border-black rounded-full px-4 py-2 font-bold" required={!editingId} />
              </div>
              <div>
                <label className="font-black text-sm">ROLE</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as "PEGAWAI" | "PENGAWAS" | "ADMIN" })} className="w-full mt-1 border-2 border-black rounded-full px-4 py-2 font-bold">
                  <option value="PEGAWAI">PEGAWAI</option>
                  <option value="PENGAWAS">PENGAWAS</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label className="font-black text-sm">LOKASI/UNIT</label>
                <select value={form.lokasiId} onChange={e => setForm({ ...form, lokasiId: e.target.value })} className="w-full mt-1 border-2 border-black rounded-full px-4 py-2 font-bold">
                  <option value="">- Pilih Lokasi -</option>
                  {lokasis.map(l => <option key={l.id} value={l.id}>{l.nama}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-[#FF6B00] text-white py-3 rounded-full font-black">{editingId ? "SIMPAN" : "TAMBAH"}</button>
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null) }} className="flex-1 bg-black text-white py-3 rounded-full font-black">BATAL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}