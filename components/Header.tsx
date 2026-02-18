'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import styles from '@/styles/header.module.css'

export default function Header() {
  const { lang, toggle } = useLanguage()
  const zh = lang === 'zh'
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: zh ? '作品集' : 'Gallery' },
    { href: '/exhibitions', label: zh ? '展覽' : 'Exhibition' },
    { href: '/about', label: zh ? '關於' : 'About' },
  ]

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logoLink}>
          <Image
            src="/logo.png"
            alt={zh ? '洪德忠' : 'Leon Hong'}
            width={160}
            height={48}
            className={styles.logo}
            priority
          />
        </Link>

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
          <button onClick={toggle} className={styles.langToggle}>
            {zh ? 'EN' : '中文'}
          </button>
        </nav>
      </div>
    </header>
  )
}
