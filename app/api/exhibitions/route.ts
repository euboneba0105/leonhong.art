import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminCheck'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error
  if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const body = await req.json()
  const { data, error: dbError } = await supabaseAdmin
    .from('exhibitions')
    .insert({
      title: body.title,
      title_en: body.title_en || null,
      description: body.description || null,
      description_en: body.description_en || null,
      cover_image_url: body.cover_image_url || null,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      location: body.location || null,
      location_en: body.location_en || null,
      location_url: body.location_url || null,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error
  if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const body = await req.json()
  const { id, ...fields } = body
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const update: Record<string, any> = {}
  const allowed = ['title', 'title_en', 'description', 'description_en', 'cover_image_url', 'start_date', 'end_date', 'location', 'location_en', 'location_url', 'sort_order']
  for (const key of allowed) {
    if (key in fields) update[key] = fields[key] || null
  }

  const { data, error: dbError } = await supabaseAdmin
    .from('exhibitions')
    .update(update)
    .eq('id', id)
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
  const { error: dbError } = await supabaseAdmin
    .from('exhibitions')
    .delete()
    .eq('id', id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
