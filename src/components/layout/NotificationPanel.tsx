import React, { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { NotificationCenter } from '@/components/system/NotificationCenter'
import { useSystemNotifications } from '@/hooks/useSystemNotifications'
import { NOTIFICATIONS_ENABLED } from '@/config/features'


export const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  if (!NOTIFICATIONS_ENABLED) return null

  const { 
    notifications, 
    unreadCount, 
    criticalNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  } = useSystemNotifications()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant={criticalNotifications.length > 0 ? "destructive" : "default"} 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[500px] sm:w-[600px] p-0">
        <SheetHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              System Notifications
              {unreadCount > 0 && (
                <Badge variant={criticalNotifications.length > 0 ? "destructive" : "default"}>
                  {unreadCount} new
                </Badge>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>
        
        <div className="px-6 pb-6">
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDeleteNotification={deleteNotification}
            onClearAll={clearAllNotifications}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}