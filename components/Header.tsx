'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useLanguage } from './LanguageProvider'
import styles from '@/styles/header.module.css'

export default function Header() {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()
  const isAdmin = !!(session?.user as any)?.isAdmin

  // Hide header on immersive homepage (after all hooks)
  if (pathname === '/') return null

  const isPortfolioActive = pathname === '/gallery' || pathname.startsWith('/series') || pathname.startsWith('/artworks')

  const navItems = [
    { href: '/events', label: zh ? '活動' : 'Events' },
    { href: '/about', label: zh ? '關於' : 'About' },
    { href: '/contact', label: zh ? '聯繫' : 'Contact' },
  ]

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* Hamburger button – mobile only */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLineTop : ''}`} />
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLineMid : ''}`} />
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerLineBot : ''}`} />
        </button>

        {/* Logo – always centered on mobile */}
        <Link href="/" className={styles.logoLink}>
          <Image
            src="/logo.png"
            alt={zh ? '洪德忠' : 'Leon Hong'}
            width={200}
            height={60}
            className={styles.logo}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li>
              <Link
                href="/gallery"
                className={`${styles.navLink} ${isPortfolioActive ? styles.navLinkActive : ''}`}
              >
                {zh ? '作品集' : 'Gallery'}
              </Link>
            </li>

            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <li>
                <button onClick={() => signOut()} className={styles.signOutBtn}>
                  {zh ? '登出' : 'Sign Out'}
                </button>
              </li>
            )}
          </ul>
        </nav>

        {/* Spacer to balance hamburger on mobile */}
        <div className={styles.spacer} />
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav className={styles.mobileNav}>
          <ul className={styles.mobileNavList}>
            <li>
              <Link
                href="/gallery"
                className={`${styles.mobileNavLink} ${isPortfolioActive ? styles.navLinkActive : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {zh ? '作品集' : 'Gallery'}
              </Link>
            </li>

            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.mobileNavLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <li>
                <button
                  onClick={() => { signOut(); setMenuOpen(false) }}
                  className={styles.mobileSignOutBtn}
                >
                  {zh ? '登出' : 'Sign Out'}
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  )
}
