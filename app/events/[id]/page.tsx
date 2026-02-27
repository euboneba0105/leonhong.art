export const revalidate = 60

import { supabase, type Exhibition, type EventGalleryPhoto } from '@/lib/supabaseClient'
import { notFound } from 'next/navigation'
import EventDetailContent from '@/components/EventDetailContent'
import { alternatesFor } from '@/lib/locale'

async function getEvent(id: string): Promise<Exhibition | null> {
  const { data, error } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

async function getGalleryPhotos(exhibitionId: string): Promise<EventGalleryPhoto[]> {
  const { data, error } = await supabase
    .from('event_gallery_photos')
    .select('*')
    .eq('exhibition_id', exhibitionId)
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await getEvent(id)
  const title = event ? (event.title || event.title_en) : '活動'
  return {
    title,
    alternates: alternatesFor(`/events/${id}`),
  }
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await getEvent(id)
  if (!event) notFound()

  const galleryPhotos = await getGalleryPhotos(id)

  return <EventDetailContent event={event} galleryPhotos={galleryPhotos} />
}
