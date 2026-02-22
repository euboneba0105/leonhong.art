'use client'

import { useEffect } from 'react'

/**
 * 禁止網站上所有圖片使用右鍵選單（防止另存圖片）。
 * 僅對 <img> 與 <picture> 內元素攔截，不影響其他區塊的右鍵功能。
 */
export default function DisableImageContextMenu() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as Node
      if (!target || !('tagName' in target)) return
      const el = target as HTMLElement
      if (el.tagName === 'IMG' || el.closest?.('picture')) {
        e.preventDefault()
      }
    }
    document.addEventListener('contextmenu', handleContextMenu)
    return () => document.removeEventListener('contextmenu', handleContextMenu)
  }, [])
  return null
}
