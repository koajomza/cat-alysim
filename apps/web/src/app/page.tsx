
export default function Page() {
  return (
    <main className="min-h-dvh grid place-items-center p-10">
      <div className="max-w-xl text-center space-y-3">
        <h1 className="text-3xl font-bold">CAT-ALYSIM</h1>
        <p className="text-slate-300">Next.js + Supabase starter. ไปหน้า verify ลองใส่ token ดู</p>
        <a href="/verify?token=DEMO" className="inline-block rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">
          ทดลอง /verify?token=DEMO
        </a>
      </div>
    </main>
  )
}
