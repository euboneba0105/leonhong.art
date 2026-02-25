export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase, type Exhibition } from '@/lib/supabaseClient'
import EventsContent from '@/components/EventsContent'
import { alternatesFor } from '@/lib/locale'

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
  title: 'Events',
  description: 'Events, exhibitions, talks and more.',
  alternates: alternatesFor('/en/events'),
}

export default async function EnEventsPage() {
  const events = await getEvents()

  return <EventsContent events={events} />
}
