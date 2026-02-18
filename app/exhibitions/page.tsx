export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase, type Exhibition } from '@/lib/supabaseClient'
import ExhibitionsContent from '@/components/ExhibitionsContent'

async function getExhibitions(): Promise<Exhibition[]> {
  try {
    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Supabase error (exhibitions):', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching exhibitions:', error)
    return []
  }
}

export const metadata = {
  title: 'Exhibitions',
  description: 'Exhibition information and upcoming shows.',
}

export default async function ExhibitionsPage() {
  const exhibitions = await getExhibitions()

  return <ExhibitionsContent exhibitions={exhibitions} />
}
