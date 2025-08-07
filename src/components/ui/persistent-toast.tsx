import * as React from "react"
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
    className: `${
      variant === 'success' ? 'border-emerald-200 bg-emerald-50' :
      variant === 'warning' ? 'border-amber-200 bg-amber-50' :
      variant === 'error' ? 'border-red-200 bg-red-50' :
      variant === 'critical' ? 'border-red-300 bg-red-100 ring-2 ring-red-500/50' :
      variant === 'info' ? 'border-blue-200 bg-blue-50' :
      variant === 'pending' ? 'border-orange-200 bg-orange-50' :
      'border'
    }`,
    closeButton: true, // Always show close button for better UX
    position: priority === 'critical' ? 'top-center' : 'top-right',
  })
}

export const PersistentToaster = () => {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
        className: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
      }}
      richColors
      expand
      visibleToasts={5}
    />
  )
}