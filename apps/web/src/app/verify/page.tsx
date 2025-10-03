
'use client'
import { useMemo, useEffect, useState } from 'react'

export default function VerifyPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = useMemo(() => searchParams?.token ?? '', [searchParams])
  const [status, setStatus] = useState<'idle'|'loading'|'ok'|'fail'>('idle')
  const [detail, setDetail] = useState<any>(null)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      setStatus('loading')
      try {
        const endpoint = process.env.NEXT_PUBLIC_VERIFY_ENDPOINT!
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.message || res.statusText)
        setDetail(data); setStatus('ok')
      } catch (e:any) {
        setDetail(String(e)); setStatus('fail')
      }
    })()
  }, [token])

  return (
    <main className="min-h-dvh px-6 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
        <h1 className="text-xl font-semibold mb-1">Verify</h1>
        {!token && <p className="text-rose-400">ไม่พบ token</p>}
        {token && status==='loading' && <p className="text-sky-300">กำลังตรวจสอบ…</p>}
        {status==='ok' && <pre className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 overflow-auto text-sm">{JSON.stringify(detail,null,2)}</pre>}
        {status==='fail' && <pre className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 overflow-auto text-sm">{String(detail)}</pre>}
      </div>
    </main>
  )
}
