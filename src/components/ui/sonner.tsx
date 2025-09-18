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
      offset={20}
      gap={12}
      duration={4000}
      closeButton={true}
      richColors={true}
      expand={true}
      visibleToasts={5}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border group-[.toaster]:border-border/50 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-sm group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:min-h-[64px] group-[.toaster]:transition-all group-[.toaster]:duration-300 group-[.toaster]:ease-out group-[.toaster]:animate-slide-in data-[swipe=cancel]:group-[.toaster]:translate-x-0 data-[swipe=end]:group-[.toaster]:animate-slide-out data-[type=error]:group-[.toaster]:border-destructive/30 data-[type=error]:group-[.toaster]:bg-destructive/5 data-[type=success]:group-[.toaster]:border-emerald-500/30 data-[type=success]:group-[.toaster]:bg-emerald-50 data-[type=warning]:group-[.toaster]:border-amber-500/30 data-[type=warning]:group-[.toaster]:bg-amber-50 data-[type=info]:group-[.toaster]:border-blue-500/30 data-[type=info]:group-[.toaster]:bg-blue-50 dark:data-[type=success]:group-[.toaster]:bg-emerald-950/20 dark:data-[type=warning]:group-[.toaster]:bg-amber-950/20 dark:data-[type=info]:group-[.toaster]:bg-blue-950/20",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm group-[.toast]:leading-relaxed",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:transition-colors group-[.toast]:hover:bg-primary/90",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:transition-colors group-[.toast]:hover:bg-muted/80",
          closeButton:
            "group-[.toast]:bg-red-500/90 group-[.toast]:hover:bg-red-600 group-[.toast]:text-white group-[.toast]:shadow-lg group-[.toast]:hover:shadow-red-500/50 group-[.toast]:transition-all group-[.toast]:duration-200 group-[.toast]:hover:scale-110 group-[.toast]:focus:ring-2 group-[.toast]:focus:ring-red-300 group-[.toast]:focus:outline-none group-[.toast]:rounded-full group-[.toast]:border-none",
          title: "group-[.toast]:text-foreground group-[.toast]:font-semibold group-[.toast]:text-sm",
          content: "group-[.toast]:flex group-[.toast]:flex-col group-[.toast]:gap-1",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
