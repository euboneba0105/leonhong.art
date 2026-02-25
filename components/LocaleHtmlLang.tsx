'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { isEnPath } from '@/lib/locale'

/**
 * Sets documentElement.lang from URL so /en/* pages are announced as English.
 */
export default function LocaleHtmlLang() {
  const pathname = usePathname()
  useEffect(() => {
    document.documentElement.lang = isEnPath(pathname ?? '') ? 'en' : 'zh-Hant'
  }, [pathname])
  return null
}
