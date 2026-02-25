'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { pathToZh, pathToEn, isEnPath } from '@/lib/locale'

type Lang = 'zh' | 'en'

interface LanguageContextType {
  lang: Lang
  toggle: () => void
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'zh',
  toggle: () => {},
})

export function useLanguage() {
  return useContext(LanguageContext)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const lang: Lang = isEnPath(pathname ?? '') ? 'en' : 'zh'
  const toggle = () => {
    const nextPath = lang === 'zh' ? pathToEn(pathname ?? '/') : pathToZh(pathname ?? '/')
    router.push(nextPath)
  }
  const value = useMemo(() => ({ lang, toggle }), [lang, pathname, router])
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
