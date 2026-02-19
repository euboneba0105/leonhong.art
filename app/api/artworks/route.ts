import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminCheck'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error
  if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const body = await req.json()
  const { data, error: dbError } = await supabaseAdmin
    .from('artworks')
    .insert({
      image_url: body.image_url,
      title: body.title,
      title_en: body.title_en || null,
      series_id: body.series_id || null,
      year: body.year || null,
      medium: body.medium || null,
      medium_en: body.medium_en || null,
      size: body.size || null,
      description: body.description || null,
      description_en: body.description_en || null,
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
  const allowed = ['title', 'title_en', 'series_id', 'year', 'medium', 'medium_en', 'size', 'description', 'description_en', 'image_url']
  for (const key of allowed) {
    if (key in fields) update[key] = fields[key] || null
  }

  const { data, error: dbError } = await supabaseAdmin
    .from('artworks')
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
    .from('artworks')
    .delete()
    .eq('id', id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
