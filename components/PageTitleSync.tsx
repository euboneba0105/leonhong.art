'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useLanguage } from './LanguageProvider'

const SUFFIX = '｜Leon Hong Art'

const TITLE_MAP: Record<string, { zh: string; en: string }> = {
  '/': { zh: '洪德忠', en: 'Leon Hong — Art Portfolio' },
  '/about': { zh: '關於', en: 'About' },
  '/contact': { zh: '聯繫', en: 'Contact' },
  '/series': { zh: '作品集', en: 'Series' },
  '/events': { zh: '活動', en: 'Events' },
}

export default function PageTitleSync() {
  const pathname = usePathname()
  const { lang } = useLanguage()

  useEffect(() => {
    const entry = TITLE_MAP[pathname]
    if (!entry) return
    const title = lang === 'zh' ? entry.zh : entry.en
    document.title = `${title}${SUFFIX}`
  }, [pathname, lang])

  return null
}
