
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  if (req.method !== "POST")
    return new Response(JSON.stringify({ message:"Method not allowed" }), { status: 405 })

  const { token } = await req.json().catch(() => ({}))
  if (!token) return new Response(JSON.stringify({ message:"token is required" }), { status: 400 })

  const url = Deno.env.get("SUPABASE_URL")!
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  const sb = createClient(url, key)

  const { data: row, error } = await sb.from("paid_tokens").select("*").eq("token", token).maybeSingle()
  if (error || !row) return new Response(JSON.stringify({ message:"invalid token" }), { status: 404 })
  if (row.used) return new Response(JSON.stringify({ message:"token already used" }), { status: 409 })

  const { error: up1 } = await sb.from("paid_tokens").update({ used:true, used_at:new Date().toISOString() }).eq("token", token)
  if (up1) return new Response(JSON.stringify({ message:"update failed" }), { status: 500 })

  if (row.email) await sb.from("profiles").update({ approved:true }).eq("email", row.email)

  return new Response(JSON.stringify({ ok:true, token }), { status: 200 })
})
