import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const ZOOM_LONG_EDGE = 3000

async function getImageBuffer(imageUrl: string): Promise<Buffer> {
  const res = await fetch(imageUrl, {
    headers: { Accept: 'image/*' },
    cache: 'force-cache',
    next: { revalidate: 86400 },
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
  const format = meta.format === 'png' || meta.format === 'webp' ? meta.format : 'jpeg'
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

  try {
    const input = await getImageBuffer(imageUrl)
    const { output, contentType } = await resizeAndReturn(input, ZOOM_LONG_EDGE)
    return new NextResponse(output, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (err) {
    console.error('Image zoom proxy error:', err)
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 })
  }
}
