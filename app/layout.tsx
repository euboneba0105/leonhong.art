import './globals.css'

export const metadata = {
  title: 'Leon Hong',
  description: 'New Next.js app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  )
}
