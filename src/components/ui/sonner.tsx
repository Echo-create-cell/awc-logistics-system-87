import { useTheme } from "next-themes"
import { NOTIFICATIONS_ENABLED } from "@/config/features"
import { Toaster as Sonner, toast } from "sonner"


type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  if (!NOTIFICATIONS_ENABLED) return null

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg data-[type=error]:animate-notification-blink data-[priority=critical]:animate-notification-blink",
            description: "group-[.toast]:text-muted-foreground",
            actionButton:
              "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground animate-pulse",
            cancelButton:
              "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          },
        }}
      {...props}
    />
  )
}

export { Toaster, toast }
