export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase, type Experience } from '@/lib/supabaseClient'
import AboutContent from '@/components/AboutContent'

async function getExperiences(): Promise<Experience[]> {
  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('year', { ascending: false })

    if (error) {
      console.error('Supabase error (experiences):', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching experiences:', error)
    return []
  }
}

export const metadata = {
  title: 'About',
  description: 'About the artist — biography and experience timeline.',
}

export default async function AboutPage() {
  const experiences = await getExperiences()

  return <AboutContent experiences={experiences} />
}
