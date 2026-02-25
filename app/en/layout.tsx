import type { ReactNode } from 'react'

export const metadata = {
  title: {
    default: 'Leon Hong — Art Portfolio',
    template: '%s — Leon Hong Art',
  },
  description:
    'Leon Hong (Te-chung Hong) artist portfolio. Contemporary art, water-based and mixed media. 洪德忠藝術作品集。',
}

export default function EnLayout({ children }: { children: ReactNode }) {
  return children
}
