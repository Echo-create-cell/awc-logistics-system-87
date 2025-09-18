import * as React from "react"
import { NOTIFICATIONS_ENABLED } from "@/config/features"
import { Toaster } from "@/components/ui/sonner"
import { toast as sonnerToast } from "sonner"

import { CheckCircle, AlertCircle, XCircle, Info, Clock, AlertTriangle } from "lucide-react"

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  pending: Clock,
  critical: AlertCircle,
  default: Info,
}

export interface PersistentToastOptions {
  title: string
  description?: string
  variant?: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'critical' | 'default'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  category?: string
  persistent?: boolean
  actionRequired?: boolean
  onAction?: () => void
}

// Storage for tracking notification frequency
const getNotificationKey = (category: string, title: string) => `notification_${category}_${title}`

const getWeeklyNotificationCount = (key: string): number => {
  const stored = localStorage.getItem(key)
  if (!stored) return 0
  
  const data = JSON.parse(stored)
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
  
  // Filter out old entries and count recent ones
  const recentEntries = data.filter((timestamp: number) => timestamp > oneWeekAgo)
  
  // Update storage with only recent entries
  localStorage.setItem(key, JSON.stringify(recentEntries))
  
  return recentEntries.length
}

const incrementNotificationCount = (key: string) => {
  const stored = localStorage.getItem(key)
  const timestamps = stored ? JSON.parse(stored) : []
  timestamps.push(Date.now())
  localStorage.setItem(key, JSON.stringify(timestamps))
}

export const showPersistentToast = ({
  title,
  description,
  variant = 'default',
  priority = 'medium',
  category,
  persistent = false,
  actionRequired = false,
  onAction
}: PersistentToastOptions) => {
  if (!NOTIFICATIONS_ENABLED) {
    return
  }
  // Check weekly limit for quotation and invoice notifications only
  if (category && (category.toLowerCase().includes('quotation') || category.toLowerCase().includes('invoice'))) {
    const notificationKey = getNotificationKey(category, title)
    const weeklyCount = getWeeklyNotificationCount(notificationKey)
    
    // Limit to 3 per week for quotation/invoice notifications
    if (weeklyCount >= 3) {
      return // Don't show notification if limit reached
    }
    
    // Increment count
    incrementNotificationCount(notificationKey)
  }

  const Icon = iconMap[variant]
  
  const duration = persistent || priority === 'critical' 
    ? Infinity 
    : priority === 'high' 
    ? 10000 
    : priority === 'medium' 
    ? 7000 
    : 5000

  const iconClassName = `h-5 w-5 mt-0.5 flex-shrink-0 ${
    variant === 'success' ? 'text-emerald-600' :
    variant === 'warning' ? 'text-amber-600' :
    variant === 'error' ? 'text-red-600' :
    variant === 'critical' ? 'text-red-700' :
    variant === 'info' ? 'text-blue-600' :
    variant === 'pending' ? 'text-orange-600' :
    'text-foreground'
  }`

  return sonnerToast.custom(
    () => (
      <div className="professional-notification-item professional-toast group min-w-[356px] max-w-md p-4 flex items-start gap-3 pointer-events-auto relative overflow-hidden">
        {/* Professional gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/10 pointer-events-none" />
        
        {/* Icon with enhanced styling */}
        <div className="flex-shrink-0 relative z-10 p-1 rounded-full bg-white/20 backdrop-blur-sm">
          <Icon className={iconClassName} />
        </div>
        
        {/* Content with professional typography */}
        <div className="flex-1 relative z-10">
          <div className="font-semibold text-foreground leading-tight mb-1 tracking-tight">
            {category ? `${category}: ${title}` : title}
          </div>
          {description && (
            <div className="text-sm text-muted-foreground leading-relaxed opacity-90">
              {description}
            </div>
          )}
          
          {/* Enhanced Action Button */}
          {actionRequired && (
            <div className="flex gap-2 pt-2">
              <button 
                onClick={onAction}
                className="text-sm bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg"
              >
                View Details →
              </button>
            </div>
          )}
        </div>
      </div>
    ),
    {
      duration,
      position: 'top-right',
      style: {
        zIndex: 99998,
      }
    }
  )
}

export function PersistentToaster() {
  if (!NOTIFICATIONS_ENABLED) return null;
  
  return (
    <div className="professional-notification-zone">
      <Toaster 
        position="top-right"
        richColors={true}
        expand={false}
        visibleToasts={4}
        gap={8}
        toastOptions={{
          duration: 5000,
          style: {
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            padding: 0,
            margin: 0,
            width: '100%',
            maxWidth: '400px',
          },
          className: 'professional-notification-item',
          descriptionClassName: 'professional-toast-description',
        }}
      />
    </div>
  )
}