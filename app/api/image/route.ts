import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'

const DISPLAY_LONG_EDGE = 1000
const IMAGE_CACHE_MAX = 80
const IMAGE_CACHE_TTL_MS = 5 * 60 * 1000 // 5 min

type CacheEntry = { output: Buffer; contentType: string; ts: number }
const imageCache = new Map<string, CacheEntry>()

function evictImageCacheIfNeeded() {
  if (imageCache.size <= IMAGE_CACHE_MAX) return
  let oldestKey: string | null = null
  let oldestTs = Infinity
  for (const [k, v] of imageCache) {
    if (v.ts < oldestTs) {
      oldestTs = v.ts
      oldestKey = k
    }
  }
  if (oldestKey) imageCache.delete(oldestKey)
}

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
  const quality = maxLongEdge <= 300 ? 72 : 90
  const output = await sharp(input)
    .resize(maxLongEdge, maxLongEdge, { fit: 'inside', withoutEnlargement: true })
    .toFormat(format, format === 'jpeg' ? { quality } : undefined)
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

  const maxLongEdge = w ? Math.min(2400, Math.max(200, parseInt(w, 10)) || DISPLAY_LONG_EDGE) : DISPLAY_LONG_EDGE
  const cacheKey = `${id}:${maxLongEdge}`

  const cached = imageCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < IMAGE_CACHE_TTL_MS) {
    return new NextResponse(cached.output as unknown as BodyInit, {
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
        ...(maxLongEdge > 1000 ? { 'X-Robots-Tag': 'noindex' } : {}),
      },
    })
  }

  try {
    const input = await getImageBuffer(imageUrl)
    const { output, contentType } = await resizeAndReturn(input, maxLongEdge)
    imageCache.set(cacheKey, { output, contentType, ts: Date.now() })
    evictImageCacheIfNeeded()
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
    }
    if (maxLongEdge > 1000) {
      headers['X-Robots-Tag'] = 'noindex'
    }
    return new NextResponse(output as unknown as BodyInit, { headers })
  } catch (err) {
    console.error('Image proxy error:', err)
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 })
  }
}
