import './globals.css'
import { LanguageProvider } from '@/components/LanguageProvider'
import SessionProvider from '@/components/SessionProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Leon Hong — Art Portfolio',
  description: 'Artist portfolio powered by Next.js and Supabase',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <SessionProvider>
          <LanguageProvider>
            <Header />
            {children}
            <Footer />
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
