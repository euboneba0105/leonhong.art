'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

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
  const [lang, setLang] = useState<Lang>('zh')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved === 'en' || saved === 'zh') setLang(saved)
  }, [])

  const toggle = () => {
    const next = lang === 'zh' ? 'en' : 'zh'
    setLang(next)
    localStorage.setItem('lang', next)
  }

  return (
    <LanguageContext.Provider value={{ lang, toggle }}>
      {children}
    </LanguageContext.Provider>
  )
}
