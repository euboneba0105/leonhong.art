import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getArtworkImageInfo } from '@/lib/imageUrlCache'

// Cache-Control 含 s-maxage：前面掛 CDN（如 Cloudflare）可快取，減少 Fast Origin Transfer
export const runtime = 'nodejs'

const ZOOM_SHORT_EDGE_DEFAULT = 2000
const ZOOM_SHORT_EDGE_MIN = 600
const ZOOM_SHORT_EDGE_MAX = 2000

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
  maxShortEdge: number
): Promise<{ output: Buffer; contentType: string }> {
  const meta = await sharp(input).metadata().catch(() => ({}))
  const format =
    'format' in meta && (meta.format === 'png' || meta.format === 'webp')
      ? meta.format
      : 'jpeg'
  const width = ('width' in meta && typeof meta.width === 'number') ? meta.width : 0
  const height = ('height' in meta && typeof meta.height === 'number') ? meta.height : 0
  const shortEdge = Math.min(width, height) || 1
  const scale = Math.min(1, maxShortEdge / shortEdge)
  const newW = Math.round(width * scale)
  const newH = Math.round(height * scale)
  const output = await sharp(input)
    .resize(newW, newH, { fit: 'inside' })
    .toFormat(format, format === 'jpeg' ? { quality: 90 } : undefined)
    .toBuffer()
  const contentType =
    format === 'webp' ? 'image/webp' : format === 'png' ? 'image/png' : 'image/jpeg'
  return { output, contentType }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const w = searchParams.get('w') // optional: max short edge by screen (600–2000), CDN cache key

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const parsed = w ? parseInt(w, 10) : NaN
  const maxShortEdge =
    Number.isFinite(parsed) && parsed > 0
      ? Math.min(ZOOM_SHORT_EDGE_MAX, Math.max(ZOOM_SHORT_EDGE_MIN, parsed))
      : ZOOM_SHORT_EDGE_DEFAULT

  const imageInfo = await getArtworkImageInfo(id)
  if (!imageInfo) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const { url: imageUrl, no_image_index } = imageInfo

  try {
    const input = await getImageBuffer(imageUrl)
    const { output, contentType } = await resizeAndReturn(input, maxShortEdge)
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
    }
    if (no_image_index) headers['X-Robots-Tag'] = 'noindex'
    return new NextResponse(output as unknown as BodyInit, { headers })
  } catch (err) {
    console.error('Image zoom proxy error:', err)
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 })
  }
}
