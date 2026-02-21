import { NextRequest, NextResponse } from 'next/server'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { requireAdmin } from '@/lib/adminCheck'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2Client'
import { artworkWithProxyUrl } from '@/lib/imageProxy'

async function syncTags(artworkId: string, tagIds: string[]) {
  if (!supabaseAdmin) return
  await supabaseAdmin.from('artwork_tags').delete().eq('artwork_id', artworkId)
  if (tagIds.length > 0) {
    await supabaseAdmin.from('artwork_tags').insert(
      tagIds.map((tag_id) => ({ artwork_id: artworkId, tag_id }))
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

    const body = await req.json()
    const { tag_ids, ...fields } = body

    const { data, error: dbError } = await supabaseAdmin
      .from('artworks')
      .insert({
        image_url: fields.image_url,
        title: fields.title,
        title_en: fields.title_en || null,
        series_id: fields.series_id || null,
        year: fields.year || null,
        medium: fields.medium || null,
        medium_en: fields.medium_en || null,
        size: fields.size || null,
        description: fields.description || null,
        description_en: fields.description_en || null,
      })
      .select()
      .single()

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

    if (tag_ids && Array.isArray(tag_ids)) {
      await syncTags(data.id, tag_ids)
    }

    return NextResponse.json(artworkWithProxyUrl(data))
  } catch (err: any) {
    console.error('POST /api/artworks error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error
    if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

    const body = await req.json()
    const { id, tag_ids, ...fields } = body
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const update: Record<string, any> = {}
    const allowed = ['title', 'title_en', 'series_id', 'year', 'medium', 'medium_en', 'size', 'description', 'description_en', 'image_url']
    for (const key of allowed) {
      if (key in fields) update[key] = fields[key] || null
    }

    // If image is being replaced, fetch old URL to delete from R2
    let oldImageUrl: string | null = null
    if (update.image_url) {
      const { data: existing } = await supabaseAdmin
        .from('artworks')
        .select('image_url')
        .eq('id', id)
        .single()
      if (existing?.image_url && existing.image_url !== update.image_url) {
        oldImageUrl = existing.image_url
      }
    }

    const { data, error: dbError } = await supabaseAdmin
      .from('artworks')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    // Delete old image from R2 after successful update
    if (!dbError && oldImageUrl && r2Client) {
      try {
        const baseUrl = R2_PUBLIC_URL.replace(/\/+$/, '')
        const key = oldImageUrl.replace(`${baseUrl}/`, '')
        await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }))
      } catch (e) {
        console.error('Failed to delete old R2 object:', e)
      }
    }

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

    if (tag_ids && Array.isArray(tag_ids)) {
      await syncTags(id, tag_ids)
    }

    return NextResponse.json(artworkWithProxyUrl(data))
  } catch (err: any) {
    console.error('PATCH /api/artworks error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error
  if (!supabaseAdmin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { id } = await req.json()

  // Fetch the artwork to get image_url before deleting
  const { data: artwork } = await supabaseAdmin
    .from('artworks')
    .select('image_url')
    .eq('id', id)
    .single()

  const { error: dbError } = await supabaseAdmin
    .from('artworks')
    .delete()
    .eq('id', id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  // Delete the image from R2
  if (artwork?.image_url && r2Client) {
    try {
      const baseUrl = R2_PUBLIC_URL.replace(/\/+$/, '')
      const key = artwork.image_url.replace(`${baseUrl}/`, '')
      await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    } catch (e) {
      console.error('Failed to delete R2 object:', e)
    }
  }

  return NextResponse.json({ success: true })
}
