import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, XCircle, Info, Clock, Zap, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

const toastNotificationVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
        warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
        error: "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
        info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
        pending: "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-100",
        critical: "border-red-300 bg-red-100 text-red-950 dark:border-red-700 dark:bg-red-900 dark:text-red-50 ring-2 ring-red-500/50 animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  pending: Clock,
  critical: AlertCircle,
  default: Zap,
}

export interface ToastNotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastNotificationVariants> {
  title?: string
  description?: string
  onClose?: () => void
  showIcon?: boolean
  action?: React.ReactNode
  timestamp?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  category?: string
  persistent?: boolean
}

const ToastNotification = React.forwardRef<HTMLDivElement, ToastNotificationProps>(
  ({ 
    className, 
    variant, 
    title, 
    description, 
    onClose, 
    showIcon = true, 
    action, 
    timestamp, 
    priority = 'medium',
    category,
    persistent = false,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)
    const Icon = iconMap[variant || 'default']

    const handleClose = () => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }

    if (!isVisible) return null

    return (
      <div
        ref={ref}
        className={cn(toastNotificationVariants({ variant }), className)}
        {...props}
      >
        <div className="flex w-full items-start gap-4">
          {showIcon && (
            <div className="flex-shrink-0 mt-0.5">
              <Icon className={cn(
                "h-5 w-5",
                variant === 'success' && "text-emerald-600 dark:text-emerald-400",
                variant === 'warning' && "text-amber-600 dark:text-amber-400",
                variant === 'error' && "text-red-600 dark:text-red-400",
                variant === 'info' && "text-blue-600 dark:text-blue-400",
                variant === 'pending' && "text-orange-600 dark:text-orange-400",
                variant === 'critical' && "text-red-700 dark:text-red-300",
                variant === 'default' && "text-foreground"
              )} />
            </div>
          )}
          
          <div className="flex-1 space-y-1">
            {title && (
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold leading-tight">
                  {title}
                </h4>
                {priority === 'critical' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse">
                    URGENT
                  </span>
                )}
              </div>
            )}
            
            {description && (
              <p className="text-sm opacity-90 leading-relaxed">
                {description}
              </p>
            )}
            
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-xs opacity-75">
                {category && (
                  <span className="px-2 py-1 rounded-md bg-black/10 dark:bg-white/10">
                    {category}
                  </span>
                )}
                {timestamp && (
                  <span>{timestamp}</span>
                )}
              </div>
              
              {priority && (
                <span className="text-xs opacity-60 capitalize">
                  {priority} priority
                </span>
              )}
            </div>
            
            {action && (
              <div className="pt-2">
                {action}
              </div>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute right-2 top-2 h-6 w-6 p-0 bg-pink-500 text-white hover:bg-pink-600 rounded-full shadow-lg shadow-pink-500/50 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        
        {priority === 'critical' && (
          <div className="absolute inset-0 rounded-md bg-gradient-to-r from-red-500/10 to-orange-500/10 pointer-events-none" />
        )}
      </div>
    )
  }
)

ToastNotification.displayName = "ToastNotification"

export { ToastNotification, toastNotificationVariants }