import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminCheck'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('homepage_carousel')
      .select('artwork_id')
      .order('display_order', { ascending: true })

    if (error) {
      // Table might not exist yet — return empty
      return NextResponse.json([])
    }

    return NextResponse.json((data || []).map((d: any) => d.artwork_id))
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

    const { artwork_ids } = await req.json()
    if (!Array.isArray(artwork_ids)) {
      return NextResponse.json({ error: 'artwork_ids must be an array' }, { status: 400 })
    }

    // Delete all existing entries
    await supabaseAdmin
      .from('homepage_carousel')
      .delete()
      .not('id', 'is', null)

    // Insert new entries with display_order
    if (artwork_ids.length > 0) {
      const rows = artwork_ids.map((artwork_id: string, i: number) => ({
        artwork_id,
        display_order: i,
      }))
      const { error: insertErr } = await supabaseAdmin
        .from('homepage_carousel')
        .insert(rows)

      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('POST /api/homepage-carousel error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
