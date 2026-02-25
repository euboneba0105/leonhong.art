export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase, type Award, type CvExhibition } from '@/lib/supabaseClient'
import AboutContent from '@/components/AboutContent'
import { alternatesFor } from '@/lib/locale'

async function getAwards(): Promise<Award[]> {
  try {
    const { data, error } = await supabase
      .from('awards')
      .select('*')
      .order('year', { ascending: false })

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

async function getCvExhibitions(): Promise<CvExhibition[]> {
  try {
    const { data, error } = await supabase
      .from('cv_exhibitions')
      .select('*')
      .order('year', { ascending: false })

    if (error) {
      console.error('Supabase error (cv_exhibitions):', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching cv_exhibitions:', error)
    return []
  }
}

export const metadata = {
  title: 'About',
  description: 'Artist Leon Hong — biography, awards and exhibition history.',
  alternates: alternatesFor('/en/about'),
}

export default async function EnAboutPage() {
  const [awards, cvExhibitions] = await Promise.all([
    getAwards(),
    getCvExhibitions(),
  ])

  return <AboutContent awards={awards} cvExhibitions={cvExhibitions} />
}
