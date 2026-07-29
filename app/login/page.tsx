"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("pegawai@ayam.com")
  const [password, setPassword] = useState("123456")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", { // <-- INI YANG BENER
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        const errorText = data.error ? `${data.message}: ${data.error}` : data.message
        throw new Error(errorText)
      }

      localStorage.setItem("user", JSON.stringify(data.user))
      router.push("/dashboard")
    } catch (err: any) {
      alert(err.message || "Login gagal")
      setLoading(false)
    }
  }

  const quick = (r: string) => {
    if (r === 'pegawai') setEmail('pegawai@ayam.com')
    if (r === 'pengawas') setEmail('pengawas@ayam.com')
    if (r === 'admin') setEmail('admin@ayam.com')
    setPassword('123456')
  }

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex">
      <div className="hidden md:flex w-1/2 bg-black text-white p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-3"><div className="w-10 h-10 bg-[#FF6B00] rounded-full flex items-center justify-center font-black">A</div><div><h1 className="font-black">AYAMKU</h1><p className="text- text-[#FFCC00]">FRIED CHICKEN</p></div></Link>
        <h1 className="text-6xl font-black uppercase">MASUK<br /><span className="text-[#FF6B00]">DAPUR</span><br />AYAMKU</h1>
        <div className="text-xs text-white/30">© 2026 AYAMKU</div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w- bg-white border- border-black rounded- p-8 shadow-[8px_8px_0px_#000]">
          <h2 className="text-2xl font-black uppercase text-black">LOGIN PEGAWAI</h2>
          <p className="text-sm font-bold text-black/60 mb-6">Cek DB my_umm asli</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="text- font-black text-black tracking-widest">EMAIL</label><input value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-2 bg-white border-2 border-black rounded-full px-5 py-3.5 font-bold text-black outline-none" required /></div>
            <div><label className="text- font-black text-black tracking-widest">PASSWORD</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-2 bg-white border-2 border-black rounded-full px-5 py-3.5 font-bold text-black outline-none" required /></div>
            <button disabled={loading} className="w-full bg-[#FF6B00] border-2 border-black text-white py-4 rounded-full font-black">{loading ? "CEK DB..." : "MASUK DAPUR →"}</button>
          </form>
          <div className="mt-6 pt-6 border-t-2 border-dashed grid grid-cols-3 gap-2">
            <button onClick={() => quick('pegawai')} className="bg-black text-white py-3 rounded-full text-xs font-black">PEGAWAI</button>
            <button onClick={() => quick('pengawas')} className="bg-[#FFCC00] text-black py-3 rounded-full text-xs font-black border-2 border-black">PENGAWAS</button>
            <button onClick={() => quick('admin')} className="bg-white text-black py-3 rounded-full text-xs font-black border-2 border-black">ADMIN</button>
          </div>
        </div>
      </div>
    </div>
  )
}