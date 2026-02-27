import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getImageUrlById } from '@/lib/imageUrlCache'

// Cache-Control 含 s-maxage：前面掛 CDN（如 Cloudflare）可快取，減少 Fast Origin Transfer
export const runtime = 'nodejs'

const ZOOM_LONG_EDGE_DEFAULT = 3000
const ZOOM_LONG_EDGE_MIN = 1000
const ZOOM_LONG_EDGE_MAX = 3000

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
  const w = searchParams.get('w') // optional: max long edge by screen (1000–3000), CDN cache key

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const parsed = w ? parseInt(w, 10) : NaN
  const maxLongEdge =
    Number.isFinite(parsed) && parsed > 0
      ? Math.min(ZOOM_LONG_EDGE_MAX, Math.max(ZOOM_LONG_EDGE_MIN, parsed))
      : ZOOM_LONG_EDGE_DEFAULT

  const imageUrl = await getImageUrlById(id)
  if (!imageUrl) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const input = await getImageBuffer(imageUrl)
    const { output, contentType } = await resizeAndReturn(input, maxLongEdge)
    return new NextResponse(output as unknown as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
        'X-Robots-Tag': 'noindex',
      },
    })
  } catch (err) {
    console.error('Image zoom proxy error:', err)
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 })
  }
}
