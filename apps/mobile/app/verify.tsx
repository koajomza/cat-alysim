
import { useEffect, useState } from 'react'
import { ScrollView, Text, ActivityIndicator } from 'react-native'

export default function VerifyScreen() {
  const [token, setToken] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle'|'loading'|'ok'|'fail'>('idle')
  const [detail, setDetail] = useState<any>(null)

  useEffect(() => {
    try {
      const url = new URL((global as any).location?.href ?? 'http://app.local/verify?token=DEMO')
      setToken(url.searchParams.get('token'))
    } catch {}
  }, [])

  useEffect(() => {
    const endpoint = process.env.EXPO_PUBLIC_VERIFY_ENDPOINT
    if (!token || !endpoint) return
    ;(async () => {
      setStatus('loading')
      try {
        const res = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token })})
        const data = await res.json().catch(()=> ({}))
        if (!res.ok) throw new Error(data?.message || res.statusText)
        setDetail(data); setStatus('ok')
      } catch (e:any) {
        setDetail(String(e)); setStatus('fail')
      }
    })()
  }, [token])

  return (
    <ScrollView contentContainerStyle={{ padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:'600' }}>Verify</Text>
      {!token && <Text style={{ color:'tomato' }}>ไม่พบ token</Text>}
      {status==='loading' && <ActivityIndicator/>}
      {status==='ok' && <Text style={{ color:'green' }}>ยืนยันสำเร็จ</Text>}
      {status==='fail' && <Text style={{ color:'tomato' }}>ยืนยันไม่สำเร็จ</Text>}
      {detail && <Text>{JSON.stringify(detail,null,2)}</Text>}
    </ScrollView>
  )
}
