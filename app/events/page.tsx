export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase, type Exhibition, type Award } from '@/lib/supabaseClient'
import EventsContent from '@/components/EventsContent'

async function getExhibitions(): Promise<Exhibition[]> {
  try {
    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .order('year', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

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

async function getAwards(): Promise<Award[]> {
  try {
    const { data, error } = await supabase
      .from('awards')
      .select('*')
      .order('year', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error (awards):', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching awards:', error)
    return []
  }
}

export const metadata = {
  title: 'Events',
  description: 'Events, exhibitions, talks and more.',
}

export default async function EventsPage() {
  const [exhibitions, awards] = await Promise.all([getExhibitions(), getAwards()])

  return <EventsContent exhibitions={exhibitions} awards={awards} />
}
