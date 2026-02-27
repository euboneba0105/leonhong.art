/**
 * In-memory cache for artwork id -> image_url.
 * Used by /api/image and /api/image/zoom so we don't hit the DB on every request.
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin'

const URL_CACHE_MAX = 500
const URL_CACHE_TTL_MS = 60 * 60 * 1000 // 1 hr

type UrlEntry = { url: string; ts: number }
const urlCache = new Map<string, UrlEntry>()

function evictIfNeeded() {
  if (urlCache.size <= URL_CACHE_MAX) return
  let oldestKey: string | null = null
  let oldestTs = Infinity
  for (const [k, v] of urlCache) {
    if (v.ts < oldestTs) {
      oldestTs = v.ts
      oldestKey = k
    }
  }
  if (oldestKey) urlCache.delete(oldestKey)
}

/** Returns image_url for artwork id; uses cache so we don't query DB every time. */
export async function getImageUrlById(id: string): Promise<string | null> {
  const cached = urlCache.get(id)
  if (cached && Date.now() - cached.ts < URL_CACHE_TTL_MS) {
    return cached.url
  }
  if (!supabaseAdmin) return null
  const { data } = await supabaseAdmin
    .from('artworks')
    .select('image_url')
    .eq('id', id)
    .single()
  const url = data?.image_url ?? null
  if (url) {
    urlCache.set(id, { url, ts: Date.now() })
    evictIfNeeded()
  }
  return url
}
