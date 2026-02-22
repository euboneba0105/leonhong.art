import type { Series } from '@/lib/supabaseClient'

/**
 * 將字串轉成 URL 用 slug：小寫、空白與特殊字元改為連字、去除首尾連字。
 */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * 系列的 URL slug：優先使用英文名，無則用 id（相容舊連結與無 name_en 的系列）。
 */
export function seriesSlug(series: Series): string {
  const name = series.name_en || series.name
  if (name && slugify(name).length > 0) return slugify(name)
  return series.id
}
