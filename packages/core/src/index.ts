
import { createClient } from '@supabase/supabase-js'
export function createSb(url: string, key: string) {
  return createClient(url, key)
}
