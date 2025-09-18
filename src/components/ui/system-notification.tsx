import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, XCircle, Info, Clock, Zap, AlertTriangle } from "lucide-react"

const systemNotificationVariants = cva(
  "professional-notification-item professional-toast relative w-full rounded-xl p-4 transition-all duration-500 ease-out animate-professional-slide-in",
  {
    variants: {
      variant: {
        default: "text-popover-foreground animate-subtle-glow-pulse",
        success: "text-emerald-900 dark:text-emerald-100 --glow-color:rgba(34,197,94,0.4) animate-subtle-glow-pulse",
        warning: "text-amber-900 dark:text-amber-100 --glow-color:rgba(245,158,11,0.4) animate-subtle-glow-pulse",
        error: "text-red-900 dark:text-red-100 --glow-color:rgba(239,68,68,0.4) animate-subtle-glow-pulse",
        info: "text-blue-900 dark:text-blue-100 --glow-color:rgba(59,130,246,0.4) animate-subtle-glow-pulse",
        pending: "text-orange-900 dark:text-orange-100 --glow-color:rgba(251,146,60,0.4) animate-subtle-glow-pulse",
        critical: "text-red-900 dark:text-red-100 --glow-color:rgba(239,68,68,0.6) animate-subtle-glow-pulse ring-2 ring-red-500/30",
      },
      size: {
        default: "p-4",
        sm: "p-3",
        lg: "p-6",
      },
      position: {
        "top-right": "professional-notification-item",
        "top-left": "professional-notification-item",
        "bottom-right": "professional-notification-item",
        "bottom-left": "professional-notification-item", 
        "top-center": "professional-notification-item",
        inline: "relative w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      position: "top-right",
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
          "cursor-pointer hover:scale-102 hover:-translate-x-1",
          !isVisible && "animate-professional-slide-out",
          priority === 'critical' && "animate-professional-stack-adjust",
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
                  <h4 className="text-sm font-semibold leading-tight mb-1 text-popover-foreground">
                    {title}
                  </h4>
                )}
                {description && (
                  <p className="text-sm text-popover-foreground leading-relaxed">
                    {description}
                  </p>
                )}
                
                {(category || timestamp) && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    {category && (
                      <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground">
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
                  className="flex-shrink-0 p-2 rounded-full bg-red-500/90 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/50 transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-red-300 focus:outline-none"
                  aria-label="Close notification"
                  title="Close notification"
                >
                  <X className="h-4 w-4 drop-shadow-sm" />
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