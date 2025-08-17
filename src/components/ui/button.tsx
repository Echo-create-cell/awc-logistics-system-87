import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden transform hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-glow",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90 hover:shadow-medium",
        outline:
          "border border-border bg-background hover:bg-background text-foreground shadow-soft hover:shadow-medium hover:border-primary/50",
        secondary:
          "bg-background text-foreground border border-border hover:bg-muted/50 shadow-soft hover:shadow-medium",
        ghost: "bg-background hover:bg-muted/50 text-foreground hover:shadow-soft",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow",
        premium: "bg-gradient-primary text-primary-foreground shadow-medium hover:shadow-glow hover:animate-glow-pulse",
        glass: "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/30 shadow-soft hover:bg-white/90 dark:hover:bg-gray-800/90",
        success: "bg-success text-success-foreground shadow-soft hover:bg-success/90 hover:shadow-medium",
        warning: "bg-warning text-warning-foreground shadow-soft hover:bg-warning/90 hover:shadow-medium",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
