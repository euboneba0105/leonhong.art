import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'

const DISPLAY_LONG_EDGE = 1000

async function getImageBuffer(imageUrl: string): Promise<Buffer> {
  const res = await fetch(imageUrl, {
    headers: { Accept: 'image/*' },
    cache: 'force-cache',
  })
  if (!res.ok) throw new Error('Upstream failed')
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function resizeAndReturn(
  input: Buffer,
  maxLongEdge: number
): Promise<{ output: Buffer; contentType: string }> {
  const meta = await sharp(input).metadata().catch(() => ({}))
  const format =
    'format' in meta && (meta.format === 'png' || meta.format === 'webp')
      ? meta.format
      : 'jpeg'
  const output = await sharp(input)
    .resize(maxLongEdge, maxLongEdge, { fit: 'inside', withoutEnlargement: true })
    .toFormat(format, format === 'jpeg' ? { quality: 90 } : undefined)
    .toBuffer()
  const contentType =
    format === 'webp' ? 'image/webp' : format === 'png' ? 'image/png' : 'image/jpeg'
  return { output, contentType }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const w = searchParams.get('w') // optional: max long edge (e.g. 1920 for hero, 400 for thumbs)

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const { data } = await supabaseAdmin
    .from('artworks')
    .select('image_url')
    .eq('id', id)
    .single()

  const imageUrl = data?.image_url ?? null
  if (!imageUrl) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let maxLongEdge = w ? Math.min(2400, Math.max(200, parseInt(w, 10)) || DISPLAY_LONG_EDGE) : DISPLAY_LONG_EDGE
  // Cap at 1000px so all image URLs can be indexed by Google (images >1000px are not discoverable in search)
  maxLongEdge = Math.min(maxLongEdge, 1000)

  try {
    const input = await getImageBuffer(imageUrl)
    const { output, contentType } = await resizeAndReturn(input, maxLongEdge)
    return new NextResponse(output as unknown as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch (err) {
    console.error('Image proxy error:', err)
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 })
  }
}
