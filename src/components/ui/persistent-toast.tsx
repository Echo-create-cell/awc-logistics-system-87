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

  const toastContent = (
    <div className="flex items-start gap-3 w-full">
      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
        variant === 'success' ? 'text-emerald-600' :
        variant === 'warning' ? 'text-amber-600' :
        variant === 'error' ? 'text-red-600' :
        variant === 'critical' ? 'text-red-700' :
        variant === 'info' ? 'text-blue-600' :
        variant === 'pending' ? 'text-orange-600' :
        'text-foreground'
      }`} />
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">
            {category ? `${category}: ${title}` : title}
          </h4>
          {priority === 'critical' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
              URGENT
            </span>
          )}
        </div>
        
        {description && (
          <p className="text-sm opacity-90">
            {description}
          </p>
        )}
        
        {actionRequired && (
          <div className="flex gap-2 pt-2">
            <button 
              onClick={onAction}
              className="text-sm bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-md font-medium transition-colors"
            >
              View Details →
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return sonnerToast(toastContent, {
    duration,
    className: `bg-white border border-gray-200 shadow-lg [&_button[data-close-button]]:bg-pink-500 [&_button[data-close-button]]:text-white [&_button[data-close-button]]:hover:bg-pink-600 [&_button[data-close-button]]:rounded-full [&_button[data-close-button]]:shadow-lg [&_button[data-close-button]]:shadow-pink-500/50`,
    closeButton: true,
    position: 'top-right',
    style: {
      zIndex: 9999,
    }
  })
}

export const PersistentToaster = () => {
  if (!NOTIFICATIONS_ENABLED) return null
  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none max-w-sm">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative',
            pointerEvents: 'auto',
            maxWidth: '400px',
          },
          className: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg mb-3',
        }}
        richColors
        expand={false}
        visibleToasts={5}
        gap={12}
        offset={0}
      />
    </div>
  )
}