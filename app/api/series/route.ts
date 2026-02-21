import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminCheck'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data, error } = await supabaseAdmin
    .from('series')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error
  if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const body = await req.json()
  const { data, error: dbError } = await supabaseAdmin
    .from('series')
    .insert({
      name: body.name,
      name_en: body.name_en || null,
      description: body.description || null,
      description_en: body.description_en || null,
      cover_image_id: body.cover_image_id || null,
      sort_order: body.sort_order != null ? body.sort_order : null,
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
  const allowed = ['name', 'name_en', 'description', 'description_en', 'cover_image_id', 'sort_order']
  for (const key of allowed) {
    if (key in fields) {
      if (key === 'sort_order') {
        update[key] = fields[key] == null || fields[key] === '' ? null : Number(fields[key])
      } else {
        update[key] = fields[key] || null
      }
    }
  }

  const { data, error: dbError } = await supabaseAdmin
    .from('series')
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
    .from('series')
    .delete()
    .eq('id', id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
