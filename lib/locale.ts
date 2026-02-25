/**
 * Site base URL for alternates and canonical.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://leonhong.art')

/**
 * Path without /en prefix (Chinese version of current page).
 * /en/about → /about, /en → /
 */
export function pathToZh(pathname: string): string {
  const p = pathname.replace(/^\/en\/?/, '/') || '/'
  return p
}

/**
 * Path with /en prefix (English version of current page).
 * /about → /en/about, / → /en, /en/series → /en/series
 */
export function pathToEn(pathname: string): string {
  if (pathname.startsWith('/en')) return pathname
  return pathname === '/' ? '/en' : `/en${pathname}`
}

/**
 * Base path for nav links: '' when zh, '/en' when en.
 */
export function basePath(pathname: string): string {
  return pathname.startsWith('/en') ? '/en' : ''
}

/**
 * Whether current path is English locale.
 */
export function isEnPath(pathname: string): boolean {
  return pathname.startsWith('/en')
}

/**
 * Build alternates for metadata (hreflang). Use for both zh and en pages.
 */
export function alternatesFor(pathname: string): {
  canonical: string
  languages: { 'zh-Hant': string; en: string }
} {
  const zhPath = pathToZh(pathname)
  const enPath = pathToEn(pathname)
  const zhUrl = zhPath === '/' ? SITE_URL : `${SITE_URL}${zhPath}`
  const enUrl = enPath === '/en' ? `${SITE_URL}/en` : `${SITE_URL}${enPath}`
  return {
    canonical: pathname === '/' ? SITE_URL : `${SITE_URL}${pathname}`,
    languages: { 'zh-Hant': zhUrl, en: enUrl },
  }
}
