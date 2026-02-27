import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminCheck'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { artworkWithProxyUrl } from '@/lib/imageProxy'
import type { Artwork } from '@/lib/supabaseClient'

function attachTags(rows: any[]): Artwork[] {
  return (rows || []).map(({ artwork_tags, ...rest }: any) => ({
    ...rest,
    tags: (artwork_tags || []).map((at: any) => at.tags).filter(Boolean),
  }))
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError
  if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { id: seriesId } = await params
  if (!seriesId) return NextResponse.json({ error: 'Missing series id' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('artworks')
    .select('*, artwork_tags(tags(id, name, name_en))')
    .eq('series_id', seriesId)
    .order('year', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const artworks = attachTags(data || []).map(artworkWithProxyUrl)
  return NextResponse.json(artworks)
}
