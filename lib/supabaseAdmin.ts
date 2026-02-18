import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin: any

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
} else if (supabaseUrl && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  // Fallback to anon key if service role key is not set
  supabaseAdmin = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
} else {
  supabaseAdmin = null
}

export { supabaseAdmin }
