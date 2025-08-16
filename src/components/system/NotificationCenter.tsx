import React, { useState, useEffect } from 'react'
import { SystemNotification } from '@/components/ui/system-notification'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, BellOff, Filter, Trash2, Settings, MoreVertical } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

export interface NotificationItem {
  id: string
  title: string
  description: string
  variant: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'critical' | 'default'
  category: string
  timestamp: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  read: boolean
  actionRequired?: boolean
  relatedId?: string
  relatedType?: 'quotation' | 'invoice' | 'user' | 'system'
}

interface NotificationCenterProps {
  notifications: NotificationItem[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDeleteNotification: (id: string) => void
  onClearAll: () => void
  className?: string
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  className
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const unreadCount = notifications.filter(n => !n.read).length
  const criticalCount = notifications.filter(n => n.priority === 'critical').length

  const categories = ['all', ...Array.from(new Set(notifications.map(n => n.category)))]

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false
    if (filter === 'critical' && notification.priority !== 'critical') return false
    if (selectedCategory !== 'all' && notification.category !== selectedCategory) return false
    return true
  })

  const getVariantColor = (variant: string) => {
    switch (variant) {
      case 'success': return 'bg-success/10 text-success border-success/20'
      case 'warning': return 'bg-warning/10 text-warning border-warning/20'
      case 'error': return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'info': return 'bg-primary/10 text-primary border-primary/20'
      case 'pending': return 'bg-warning/10 text-warning border-warning/20'
      case 'critical': return 'bg-destructive/20 text-destructive border-destructive/30'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return '🔥'
      case 'high': return '⚡'
      case 'medium': return '📋'
      case 'low': return '📝'
      default: return '📄'
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Center
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : 'Critical'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>
                  Unread ({unreadCount})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('critical')}>
                  Critical ({criticalCount})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onMarkAllAsRead}>
                  Mark All as Read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onClearAll} className="text-destructive">
                  Clear All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category === 'all' ? 'All Categories' : category}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-foreground mb-2">No notifications</h3>
              <p className="text-sm text-muted-foreground">
                {filter === 'all' ? "You're all caught up!" : `No ${filter} notifications found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-muted/30 border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => !notification.read && onMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getPriorityIcon(notification.priority)}</span>
                          <Badge variant="outline" className={getVariantColor(notification.variant)}>
                            {notification.category}
                          </Badge>
                          {notification.actionRequired && (
                            <Badge variant="destructive" className="text-xs">
                              Action Required
                            </Badge>
                          )}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        
                        <h4 className="font-medium text-sm mb-1 leading-tight">
                          {notification.title}
                        </h4>
                        
                        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                          {notification.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {notification.timestamp}
                          </span>
                          
                          {notification.priority === 'critical' && (
                            <Badge variant="destructive" className="text-xs animate-pulse">
                              URGENT
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteNotification(notification.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {index < filteredNotifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}