import './globals.css'
import { LanguageProvider } from '@/components/LanguageProvider'

export const metadata = {
  title: 'Art Portfolio',
  description: 'Artist portfolio powered by Next.js and Supabase',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
