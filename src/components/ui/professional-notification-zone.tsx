import * as React from "react"
import { cn } from "@/lib/utils"

interface ProfessionalNotificationZoneProps {
  children: React.ReactNode
  className?: string
}

/**
 * Professional Notification Zone
 * 
 * The ultimate unified container that ensures ALL notifications across the entire
 * system appear in exactly the same professional position with elegant stacking.
 * 
 * Features:
 * - Single fixed position: top-4 right-4 (never changes)
 * - Professional stacking with smooth animations
 * - Glass morphism effects with subtle gradients
 * - No blinking, no scattering, no extension below viewport
 * - Enhanced hover interactions and professional spacing
 * - Works with all notification types (Toast, Sonner, System, etc.)
 */
export const ProfessionalNotificationZone: React.FC<ProfessionalNotificationZoneProps> = ({
  children,
  className
}) => {
  return (
    <div
      className={cn(
        "professional-notification-zone",
        className
      )}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      <div className="professional-notification-stack">
        {children}
      </div>
    </div>
  )
}

export default ProfessionalNotificationZone