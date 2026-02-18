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
      title: body.title,
      year: body.year || null,
      medium: body.medium || null,
      size: body.size || null,
      description: body.description || null,
      image_url: body.image_url || null,
      sort_order: body.sort_order ?? 0,
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
  const { error: dbError } = await supabaseAdmin
    .from('artworks')
    .delete()
    .eq('id', id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
