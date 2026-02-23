import { supabase, type Series } from '@/lib/supabaseClient'

/**
 * Fetch series list. When publicOnly is true (default), only returns series with is_public = true.
 */
export async function getSeries(publicOnly = true): Promise<Series[]> {
  try {
    let query = supabase
      .from('series')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
    if (publicOnly) {
      query = query.eq('is_public', true)
    }
    const { data, error } = await query
    if (error) return []
    return data || []
  } catch {
    return []
  }
}
