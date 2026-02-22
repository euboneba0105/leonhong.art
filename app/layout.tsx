import './globals.css'
import { LanguageProvider } from '@/components/LanguageProvider'
import SessionProvider from '@/components/SessionProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DisableImageContextMenu from '@/components/DisableImageContextMenu'
import PageTitleSync from '@/components/PageTitleSync'

export const metadata = {
  title: {
    default: 'Leon Hong Art',
    template: '%s｜Leon Hong Art',
  },
  description: 'Artist portfolio powered by Next.js and Supabase',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@600&family=Unna:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <DisableImageContextMenu />
        <SessionProvider>
          <LanguageProvider>
            <PageTitleSync />
            <Header />
            {children}
            <Footer />
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
