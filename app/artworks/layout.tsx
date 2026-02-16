import type { ReactNode } from 'react'

export const metadata = {
  title: 'Artworks Gallery',
  description: 'Browse my collection of artwork pieces',
}

export default function ArtworksLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
