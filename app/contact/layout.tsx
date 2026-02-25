import type { ReactNode } from 'react'
import { alternatesFor } from '@/lib/locale'

export const metadata = {
  title: '聯絡',
  description: '與藝術家洪德忠 Leon Hong 聯繫。',
  alternates: alternatesFor('/contact'),
}

export default function ContactLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
