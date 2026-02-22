/**
 * Build proxy URL for artwork images so the real storage URL is never exposed to the client.
 * Only used for artworks; events and other images are unchanged.
 * @param artworkId - Artwork ID
 * @param width - Optional max long edge (e.g. 1920 for hero, 400 for thumbs) for smaller/faster loads
 */
export function artworkImageProxyUrl(artworkId: string, width?: number): string {
  const base = `/api/image?id=${encodeURIComponent(artworkId)}`
  if (width != null && width > 0) return `${base}&w=${Math.round(width)}`
  return base
}

/** Replace artwork.image_url with proxy URL when passing to client. */
export function artworkWithProxyUrl<T extends { id: string; image_url?: string | null }>(
  item: T
): T {
  if (!item.image_url) return item
  return { ...item, image_url: artworkImageProxyUrl(item.id) }
}
