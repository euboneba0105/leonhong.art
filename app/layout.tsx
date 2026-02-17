import './globals.css'

export const metadata = {
  title: 'Art Portfolio',
  description: 'Artist portfolio powered by Next.js and Supabase',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  )
}
