import type { ReactNode } from 'react'

export const metadata = {
  title: 'About',
  description: 'About the artist — biography and experience timeline.',
}

export default function AboutLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
