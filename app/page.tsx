import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      {/* HEADER */}
      <header className="bg-black text-white sticky top-0 z-50 flex justify-between items-center px-6 md:px-10 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF6B00] rounded-full flex items-center justify-center font-black text-xl">A</div>
          <div>
            <h1 className="font-black leading-none tracking-tight">MYUMM</h1>
            <p className="text- tracking-[0.2em] text-[#FFCC00] font-bold">FRIED CHICKEN</p>
          </div>
        </div>
        <Link href="/login" className="bg-[#FF6B00] text-white px-7 py-2.5 rounded-full font-black text-sm shadow-[0_0_20px_rgba(255,107,0,0.5)]">LOGIN</Link>
      </header>

      {/* HERO ORANGE */}
      <div className="bg-[#FF6B00] px-6 md:px-20 py-12 md:py-16 relative overflow-hidden">
        <div className="absolute right-0 top-0 w- h- bg-[#FFCC00] rounded-full blur- opacity-30 -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 max-w-6xl grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="bg-black text-[#FFCC00] px-4 py-1.5 rounded-full text-xs font-black">🔥 STOK SEGAR HARI INI</span>
            <h1 className="text-6xl md:text- font-black uppercase leading-[0.85] mt-5 text-black">
              AYAM<br /><span className="text-white">GORENG</span><br />JUARA
            </h1>
            <p className="mt-4 text-black font-medium max-w-sm">Kelola stok ayam, tepung & minyak lebih cepat ala kasir. Sistem internal pegawai.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="bg-black text-white px-8 py-4 rounded-full font-black text-sm">BUAT REQUEST STOK →</Link>
              <div className="bg-[#FFCC00] text-black px-6 py-4 rounded-full font-black text-sm border-2 border-black">9 AYAM • 120K</div>
            </div>
          </div>

          <div className="bg-white rounded- p-4 shadow-2xl rotate-2 border- border-black">
            <div className="bg-[#FFF0CC] rounded- h-64 flex items-center justify-center text-8xl">🍗</div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-black text-xl">BUCKET KOMPLIT</h3>
                <p className="text-sm text-gray-500">25 Ekor + Tepung 5kg</p>
              </div>
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-black">→</div>
            </div>
          </div>
        </div>
      </div>

      {/* MENU */}
      <div className="p-6 md:px-20 md:py-12">
        <div className="flex justify-between items-end mb-6">
          <h2 className="font-black text-3xl uppercase">Menu Stok 📦</h2>
          <p className="text-sm font-bold bg-[#FFCC00] px-3 py-1 rounded-full border-2 border-black">3 KATEGORI</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded- p-5 border-2 border-black shadow-[6px_6px_0px_#000]">
            <div className="w-full h-40 bg-[#FFE9A8] rounded- flex items-center justify-center text-6xl">🍗</div>
            <h3 className="font-black mt-4 text-lg">AYAM MENTAH</h3>
            <div className="mt-2 flex gap-2"><span className="bg-[#FF6B00] text-white text- font-black px-3 py-1 rounded-full">SISA 25</span><span className="bg-black text-white text- font-black px-3 py-1 rounded-full">EKOR</span></div>
          </div>
          <div className="bg-[#FFCC00] rounded- p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000]">
            <div className="w-full h-40 bg-white rounded- flex items-center justify-center text-6xl">🧂</div>
            <h3 className="font-black mt-4 text-lg">TEPUNG CRISPY</h3>
            <div className="mt-2 flex gap-2"><span className="bg-black text-white text- font-black px-3 py-1 rounded-full">SISA 10</span><span className="bg-white text-black text- font-black px-3 py-1 rounded-full border border-black">KG</span></div>
          </div>
          <div className="bg-black text-white rounded- p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000]">
            <div className="w-full h-40 bg-[#333] rounded- flex items-center justify-center text-6xl">🛢️</div>
            <h3 className="font-black mt-4 text-lg text-[#FFCC00]">MINYAK GORENG</h3>
            <div className="mt-2 flex gap-2"><span className="bg-[#FF6B00] text-white text- font-black px-3 py-1 rounded-full">SISA 5</span><span className="bg-[#FFCC00] text-black text- font-black px-3 py-1 rounded-full">LITER</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}