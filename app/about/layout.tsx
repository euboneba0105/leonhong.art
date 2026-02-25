import type { ReactNode } from 'react'
import { alternatesFor } from '@/lib/locale'

export const metadata = {
  title: '關於',
  description: '藝術家洪德忠 Leon Hong 簡歷、獲獎與展覽經歷。',
  alternates: alternatesFor('/about'),
}

export default function AboutLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
