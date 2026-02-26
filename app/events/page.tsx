export const revalidate = 60

import { supabase, type Exhibition } from '@/lib/supabaseClient'
import EventsContent from '@/components/EventsContent'

async function getEvents(): Promise<Exhibition[]> {
  try {
    const { data, error } = await supabase
      .from('exhibitions')
      .select('*')
      .order('start_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error (events):', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export const metadata = {
  title: '活動',
  description: '活動、展覽、講座等。Events, exhibitions, talks and more.',
}

export default async function EventsPage() {
  const events = await getEvents()

  return <EventsContent events={events} />
}
