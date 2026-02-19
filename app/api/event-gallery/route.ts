import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminCheck'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error
  if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const body = await req.json()
  const { exhibition_id, image_url } = body
  if (!exhibition_id || !image_url) {
    return NextResponse.json({ error: 'Missing exhibition_id or image_url' }, { status: 400 })
  }

  // Get max sort_order for this exhibition
  const { data: existing } = await supabaseAdmin
    .from('event_gallery_photos')
    .select('sort_order')
    .eq('exhibition_id', exhibition_id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0

  const { data, error: dbError } = await supabaseAdmin
    .from('event_gallery_photos')
    .insert({
      exhibition_id,
      image_url,
      sort_order: nextOrder,
    })
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error
  if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error: dbError } = await supabaseAdmin
    .from('event_gallery_photos')
    .delete()
    .eq('id', id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
