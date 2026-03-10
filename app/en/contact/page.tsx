import { Suspense } from 'react'
import ContactContent from '@/components/ContactContent'
import { alternatesFor } from '@/lib/locale'

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with artist Leon Hong.',
  alternates: alternatesFor('/en/contact'),
}

export default function EnContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactContent />
    </Suspense>
  )
}
