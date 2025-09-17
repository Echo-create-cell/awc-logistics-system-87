import * as React from "react"
import { cn } from "@/lib/utils"

interface UnifiedNotificationContainerProps {
  children: React.ReactNode
  className?: string
}

/**
 * Unified Notification Container
 * 
 * This component ensures ALL notifications appear in exactly the same fixed position
 * and stack/overlap properly instead of extending down the page.
 * 
 * Key Features:
 * - Fixed position: top-4 right-4 (16px from top, 16px from right)
 * - Maximum width: 400px 
 * - Maximum height: viewport height - 32px (prevents extending below page)
 * - Overflow: hidden (prevents any notifications from going off screen)
 * - Z-index: 99999 (ensures all notifications appear on top)
 * - Flex column reverse (newest notifications appear at top)
 */
export const UnifiedNotificationContainer: React.FC<UnifiedNotificationContainerProps> = ({
  children,
  className
}) => {
  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-[99999] pointer-events-none",
        "w-full max-w-[400px] max-h-[calc(100vh-2rem)]",
        "flex flex-col-reverse gap-1 overflow-hidden",
        className
      )}
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 99999,
        maxWidth: '400px',
        maxHeight: 'calc(100vh - 2rem)',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      {children}
    </div>
  )
}

export default UnifiedNotificationContainer