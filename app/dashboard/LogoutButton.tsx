"use client"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const router = useRouter()
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }
  return (
    <button onClick={handleLogout} className="bg-black text-white px-5 py-2.5 rounded-full font-black text-sm">
      LOGOUT
    </button>
  )
}