/**
 * In-memory cache for artwork id -> image_url and no_image_index.
 * Used by /api/image and /api/image/zoom so we don't hit the DB on every request.
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin'

const URL_CACHE_MAX = 500
const URL_CACHE_TTL_MS = 60 * 60 * 1000 // 1 hr

export type ArtworkImageInfo = { url: string; no_image_index: boolean }

type CacheEntry = { url: string; no_image_index: boolean; ts: number }
const urlCache = new Map<string, CacheEntry>()

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

/** Returns image_url and no_image_index for artwork id; uses cache. */
export async function getArtworkImageInfo(id: string): Promise<ArtworkImageInfo | null> {
  const cached = urlCache.get(id)
  if (cached && Date.now() - cached.ts < URL_CACHE_TTL_MS) {
    return { url: cached.url, no_image_index: cached.no_image_index }
  }
  if (!supabaseAdmin) return null
  const { data } = await supabaseAdmin
    .from('artworks')
    .select('image_url, no_image_index')
    .eq('id', id)
    .single()
  const url = data?.image_url ?? null
  if (url) {
    const no_image_index = Boolean(data?.no_image_index)
    urlCache.set(id, { url, no_image_index, ts: Date.now() })
    evictIfNeeded()
    return { url, no_image_index }
  }
  return null
}

/** Returns image_url for artwork id; uses cache. (Convenience for callers that only need URL.) */
export async function getImageUrlById(id: string): Promise<string | null> {
  const info = await getArtworkImageInfo(id)
  return info?.url ?? null
}
