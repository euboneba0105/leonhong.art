'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useLanguage } from './LanguageProvider'
import type { Series } from '@/lib/supabaseClient'
import styles from '@/styles/header.module.css'

export default function Header() {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobilePortfolioOpen, setMobilePortfolioOpen] = useState(false)
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const dropdownRef = useRef<HTMLLIElement>(null)
  const { data: session } = useSession()
  const isAdmin = !!(session?.user as any)?.isAdmin

  // Hide header on immersive homepage
  if (pathname === '/') return null

  useEffect(() => {
    fetch('/api/series')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSeriesList(data)
      })
      .catch(() => {})
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

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
            {/* Portfolio dropdown */}
            <li
              ref={dropdownRef}
              className={styles.dropdownWrapper}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <Link
                href="/gallery"
                className={`${styles.navLink} ${isPortfolioActive ? styles.navLinkActive : ''}`}
                onClick={() => setDropdownOpen(false)}
              >
                {zh ? '作品集' : 'Gallery'}
                <span className={styles.dropdownArrow}>▾</span>
              </Link>
              {dropdownOpen && (
                <ul className={styles.dropdownMenu}>
                  <li>
                    <Link href="/gallery" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      {zh ? '全部作品' : 'All Works'}
                    </Link>
                  </li>
                  {seriesList.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/series/${s.id}`}
                        className={styles.dropdownItem}
                        onClick={() => setDropdownOpen(false)}
                      >
                        {zh ? s.name : (s.name_en || s.name)}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/series/standalone" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      {zh ? '獨立作品' : 'Standalone'}
                    </Link>
                  </li>
                </ul>
              )}
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
            {/* Portfolio with expandable sub-menu */}
            <li>
              <button
                className={`${styles.mobileNavLink} ${isPortfolioActive ? styles.navLinkActive : ''}`}
                onClick={() => setMobilePortfolioOpen(!mobilePortfolioOpen)}
              >
                {zh ? '作品集' : 'Gallery'}
                <span className={`${styles.mobileDropdownArrow} ${mobilePortfolioOpen ? styles.mobileDropdownArrowOpen : ''}`}>▾</span>
              </button>
              {mobilePortfolioOpen && (
                <ul className={styles.mobileSubMenu}>
                  <li>
                    <Link href="/gallery" className={styles.mobileSubLink} onClick={() => setMenuOpen(false)}>
                      {zh ? '全部作品' : 'All Works'}
                    </Link>
                  </li>
                  {seriesList.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/series/${s.id}`}
                        className={styles.mobileSubLink}
                        onClick={() => setMenuOpen(false)}
                      >
                        {zh ? s.name : (s.name_en || s.name)}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/series/standalone" className={styles.mobileSubLink} onClick={() => setMenuOpen(false)}>
                      {zh ? '獨立作品' : 'Standalone'}
                    </Link>
                  </li>
                </ul>
              )}
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
