'use client'

import { ReactNode } from 'react'
import { useLanguage } from './LanguageProvider'
import admin from '@/styles/adminUI.module.css'

interface FormModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
  loading?: boolean
  onSubmit?: (e: React.FormEvent) => void
  isForm?: boolean
}

export default function FormModal({
  isOpen,
  title,
  onClose,
  children,
  loading = false,
  onSubmit,
  isForm = true,
}: FormModalProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    if (!isForm) return
    e.preventDefault()
    onSubmit?.(e)
  }

  const Component = isForm ? 'form' : 'div'

  return (
    <div className={admin.overlay} onClick={onClose}>
      <Component
        className={admin.modal}
        onClick={(e) => e.stopPropagation()}
        onSubmit={isForm ? handleSubmit : undefined}
      >
        <h2 className={admin.modalTitle}>{title}</h2>
        {children}
      </Component>
    </div>
  )
}
