'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import styles from '@/styles/header.module.css'

export default function Header() {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: zh ? '作品集' : 'Gallery' },
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
          </ul>
        </nav>

        {/* Spacer to balance hamburger on mobile */}
        <div className={styles.spacer} />
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav className={styles.mobileNav}>
          <ul className={styles.mobileNavList}>
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
          </ul>
        </nav>
      )}
    </header>
  )
}
