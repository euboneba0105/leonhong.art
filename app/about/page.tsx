export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase, type ArtistProfile, type Experience } from '@/lib/supabaseClient'
import Link from 'next/link'
import Image from 'next/image'
import styles from '@/styles/about.module.css'

async function getProfile(): Promise<ArtistProfile | null> {
  try {
    const { data, error } = await supabase
      .from('artist_profiles')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      console.error('Supabase error (profile):', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

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
  const [profile, experiences] = await Promise.all([
    getProfile(),
    getExperiences(),
  ])

  // Group experiences by year
  const experiencesByYear = experiences.reduce<Record<number, Experience[]>>((acc, exp) => {
    if (!acc[exp.year]) acc[exp.year] = []
    acc[exp.year].push(exp)
    return acc
  }, {})

  const sortedYears = Object.keys(experiencesByYear)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <h1>About</h1>
        <Link href="/" className={styles.backLink}>
          ← Back to Home
        </Link>
      </header>

      <main className={styles.mainContent}>
        {/* Artist Bio Section */}
        <section className={styles.bioSection}>
          {profile?.image_url && (
            <div className={styles.portraitWrapper}>
              <Image
                src={profile.image_url}
                alt={profile.name || 'Artist portrait'}
                width={320}
                height={320}
                className={styles.portrait}
              />
            </div>
          )}
          <div className={styles.bioContent}>
            {profile ? (
              <>
                <h2 className={styles.artistName}>{profile.name}</h2>
                <p className={styles.bioText}>{profile.bio}</p>
              </>
            ) : (
              <div className={styles.emptyState}>
                <p>Artist profile not yet available.</p>
              </div>
            )}
          </div>
        </section>

        {/* Experience Timeline Section */}
        <section className={styles.timelineSection}>
          <h2 className={styles.sectionTitle}>Experience</h2>

          {sortedYears.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No experiences listed yet.</p>
            </div>
          ) : (
            <div className={styles.timeline}>
              {sortedYears.map((year) => (
                <div key={year} className={styles.yearGroup}>
                  <div className={styles.yearLabel}>{year}</div>
                  <div className={styles.yearEntries}>
                    {experiencesByYear[year].map((exp) => (
                      <div key={exp.id} className={styles.entry}>
                        <span className={styles.categoryBadge}>{exp.category}</span>
                        <h3 className={styles.entryTitle}>{exp.title}</h3>
                        {exp.description && (
                          <p className={styles.entryDescription}>{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
