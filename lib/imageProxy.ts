/**
 * Build proxy URL for artwork images so the real storage URL is never exposed to the client.
 * Only used for artworks; events and other images are unchanged.
 */

export function artworkImageProxyUrl(artworkId: string): string {
  return `/api/image?id=${encodeURIComponent(artworkId)}`
}

/** Replace artwork.image_url with proxy URL when passing to client. */
export function artworkWithProxyUrl<T extends { id: string; image_url?: string | null }>(
  item: T
): T {
  if (!item.image_url) return item
  return { ...item, image_url: artworkImageProxyUrl(item.id) }
}
