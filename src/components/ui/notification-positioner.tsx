import * as React from "react"

/**
 * Global Notification Position Controller
 * 
 * This ensures ALL notification components across the entire system
 * are positioned in exactly the same fixed location.
 * 
 * Key Rules:
 * 1. Position: fixed top-4 right-4 (16px from top, 16px from right)
 * 2. Z-Index: 99999 (ensures all notifications appear on top)
 * 3. Max-width: 400px (prevents notifications from being too wide)
 * 4. Max-height: calc(100vh - 2rem) (prevents extending below viewport)
 * 5. Overflow: hidden (prevents any spillover)
 * 6. Flex-column-reverse (newest notifications appear at top)
 * 7. Gap: 4px (minimal spacing between stacked notifications)
 */

export const NOTIFICATION_STYLES = {
  position: 'fixed' as const,
  top: '1rem',
  right: '1rem',
  zIndex: 99999,
  maxWidth: '400px',
  maxHeight: 'calc(100vh - 2rem)',
  overflow: 'hidden' as const,
  pointerEvents: 'none' as const,
  display: 'flex' as const,
  flexDirection: 'column-reverse' as const,
  gap: '4px'
} as const

export const NOTIFICATION_CLASSES = "fixed top-4 right-4 z-[99999] max-w-[400px] max-h-[calc(100vh-2rem)] overflow-hidden pointer-events-none flex flex-col-reverse gap-1"

/**
 * Apply these styles to any notification container to ensure
 * consistent positioning across the entire application
 */
export const applyNotificationPositioning = (element: HTMLElement | null) => {
  if (!element) return
  
  Object.assign(element.style, NOTIFICATION_STYLES)
  element.className = `${element.className} ${NOTIFICATION_CLASSES}`.trim()
}

export default {
  NOTIFICATION_STYLES,
  NOTIFICATION_CLASSES,
  applyNotificationPositioning
}