import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, XCircle, Info, Clock, Zap, AlertTriangle } from "lucide-react"

const systemNotificationVariants = cva(
  "relative w-full rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-background/95 text-foreground border-border shadow-md",
        success: "bg-emerald-50/95 text-emerald-900 border-emerald-200 shadow-emerald-100/50 dark:bg-emerald-950/95 dark:text-emerald-100 dark:border-emerald-800",
        warning: "bg-amber-50/95 text-amber-900 border-amber-200 shadow-amber-100/50 dark:bg-amber-950/95 dark:text-amber-100 dark:border-amber-800",
        error: "bg-red-50/95 text-red-900 border-red-200 shadow-red-100/50 dark:bg-red-950/95 dark:text-red-100 dark:border-red-800",
        info: "bg-blue-50/95 text-blue-900 border-blue-200 shadow-blue-100/50 dark:bg-blue-950/95 dark:text-blue-100 dark:border-blue-800",
        pending: "bg-orange-50/95 text-orange-900 border-orange-200 shadow-orange-100/50 dark:bg-orange-950/95 dark:text-orange-100 dark:border-orange-800",
        critical: "bg-red-100/95 text-red-950 border-red-300 shadow-red-200/50 dark:bg-red-900/95 dark:text-red-50 dark:border-red-700",
      },
      size: {
        default: "p-4",
        sm: "p-3",
        lg: "p-6",
      },
      position: {
        "top-right": "fixed top-4 right-4 z-50 max-w-sm",
        "top-left": "fixed top-4 left-4 z-50 max-w-sm",
        "bottom-right": "fixed bottom-4 right-4 z-50 max-w-sm",
        "bottom-left": "fixed bottom-4 left-4 z-50 max-w-sm",
        "top-center": "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm",
        inline: "relative w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      position: "inline",
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

export interface SystemNotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof systemNotificationVariants> {
  title?: string
  description?: string
  onClose?: () => void
  showIcon?: boolean
  action?: React.ReactNode
  timestamp?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  category?: string
  dismissible?: boolean
  autoHide?: boolean
  hideAfter?: number
}

  const SystemNotification = React.forwardRef<HTMLDivElement, SystemNotificationProps>(
  ({ 
    className, 
    variant, 
    size, 
    position, 
    title, 
    description, 
    onClose, 
    showIcon = true, 
    action, 
    timestamp, 
    priority = 'medium',
    category,
    dismissible = true,
    autoHide = false,
    hideAfter = 0, // Default to 0 (no auto-hide) for persistent notifications
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)
    const [isHovered, setIsHovered] = React.useState(false)
    const Icon = iconMap[variant || 'default']

    React.useEffect(() => {
      // Only auto-hide if specifically enabled and not hovered
      if (autoHide && hideAfter > 0 && !isHovered) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => onClose?.(), 300) // Wait for animation
        }, hideAfter)
        return () => clearTimeout(timer)
      }
    }, [autoHide, hideAfter, onClose, isHovered])

    const handleClose = () => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }

    if (!isVisible) return null

    return (
      <div
        ref={ref}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          systemNotificationVariants({ variant, size, position }),
          "animate-in slide-in-from-top-1 fade-in duration-300 cursor-pointer",
          !isVisible && "animate-out slide-out-to-top-1 fade-out duration-300",
          "hover:shadow-lg transition-all duration-200",
          priority === 'critical' && "ring-2 ring-red-500/50 ring-opacity-75",
          className
        )}
        onClick={() => !dismissible || handleClose()}
        {...props}
      >
        <div className="flex items-start gap-3">
          {showIcon && (
            <div className="flex-shrink-0">
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
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                {title && (
                  <h4 className="text-sm font-semibold leading-tight mb-1">
                    {title}
                  </h4>
                )}
                {description && (
                  <p className="text-sm opacity-90 leading-relaxed">
                    {description}
                  </p>
                )}
                
                {(category || timestamp) && (
                  <div className="flex items-center gap-2 mt-2 text-xs opacity-75">
                    {category && (
                      <span className="px-2 py-1 rounded-md bg-black/10 dark:bg-white/10">
                        {category}
                      </span>
                    )}
                    {timestamp && (
                      <span>{timestamp}</span>
                    )}
                  </div>
                )}
              </div>
              
              {dismissible && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClose()
                  }}
                  className="flex-shrink-0 p-1.5 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50 transition-colors"
                  aria-label="Close notification"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {action && (
              <div className="mt-3">
                {action}
              </div>
            )}
          </div>
        </div>
        
        {priority === 'critical' && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 pointer-events-none animate-pulse" />
        )}
      </div>
    )
  }
)

SystemNotification.displayName = "SystemNotification"

export { SystemNotification, systemNotificationVariants }