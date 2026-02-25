import type { ReactNode } from 'react'

import { alternatesFor } from '@/lib/locale'

export const metadata = {
  title: '活動',
  description: '活動、展覽、講座等。Events, exhibitions, talks and more.',
  alternates: alternatesFor('/events'),
}

export default function EventsLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
