import { useState, useCallback, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { NotificationItem } from '@/components/system/NotificationCenter'
import { Quotation, User } from '@/types'
import { InvoiceData } from '@/types/invoice'

export interface SystemNotificationContext {
  user?: User
  timestamp?: string
  additionalInfo?: Record<string, any>
  priority?: 'low' | 'medium' | 'high' | 'critical'
  actionRequired?: boolean
  relatedId?: string
  relatedType?: 'quotation' | 'invoice' | 'user' | 'system'
}

export const useSystemNotifications = () => {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  // Generate timestamp
  const getTimestamp = () => {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Generate unique ID
  const generateId = () => {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Add notification to center
  const addNotification = useCallback((
    title: string,
    description: string,
    variant: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'critical' | 'default' = 'default',
    category: string = 'System',
    context?: SystemNotificationContext
  ) => {
    const newNotification: NotificationItem = {
      id: generateId(),
      title,
      description,
      variant,
      category,
      timestamp: context?.timestamp || getTimestamp(),
      priority: context?.priority || 'medium',
      read: false,
      actionRequired: context?.actionRequired || false,
      relatedId: context?.relatedId,
      relatedType: context?.relatedType
    }

    setNotifications(prev => [newNotification, ...prev])

    // Also show toast for immediate feedback
    toast({
      title,
      description,
      variant: variant === 'error' ? 'destructive' : 'default'
    })

    return newNotification.id
  }, [toast])

  // Enhanced notification functions
  const notifyQuotationCreated = useCallback((quotation: Quotation, context?: SystemNotificationContext) => {
    return addNotification(
      "🎯 New Quotation Created",
      `Quotation Q-${quotation.id.slice(-4)} for ${quotation.clientName} has been successfully created and is pending approval.`,
      'success',
      'Quotations',
      { 
        ...context, 
        priority: 'medium',
        actionRequired: true,
        relatedId: quotation.id,
        relatedType: 'quotation'
      }
    )
  }, [addNotification])

  const notifyQuotationApproved = useCallback((quotation: Quotation, context?: SystemNotificationContext) => {
    return addNotification(
      "✅ Quotation Approved",
      `Quotation Q-${quotation.id.slice(-4)} for ${quotation.clientName} has been approved${context?.user ? ` by ${context.user.name}` : ''}. Ready for invoice generation.`,
      'success',
      'Quotations',
      { 
        ...context, 
        priority: 'high',
        actionRequired: true,
        relatedId: quotation.id,
        relatedType: 'quotation'
      }
    )
  }, [addNotification])

  const notifyQuotationRejected = useCallback((quotation: Quotation, reason: string, context?: SystemNotificationContext) => {
    return addNotification(
      "❌ Quotation Rejected",
      `Quotation Q-${quotation.id.slice(-4)} for ${quotation.clientName} has been rejected. Reason: ${reason}`,
      'error',
      'Quotations',
      { 
        ...context, 
        priority: 'high',
        actionRequired: true,
        relatedId: quotation.id,
        relatedType: 'quotation'
      }
    )
  }, [addNotification])

  const notifyQuotationOverdue = useCallback((quotation: Quotation, daysPastDue: number, context?: SystemNotificationContext) => {
    return addNotification(
      "⏰ Quotation Overdue",
      `Quotation Q-${quotation.id.slice(-4)} for ${quotation.clientName} is ${daysPastDue} days overdue for follow-up.`,
      'warning',
      'Quotations',
      { 
        ...context, 
        priority: 'high',
        actionRequired: true,
        relatedId: quotation.id,
        relatedType: 'quotation'
      }
    )
  }, [addNotification])

  const notifyQuotationWon = useCallback((quotation: Quotation, context?: SystemNotificationContext) => {
    return addNotification(
      "🏆 Quotation Won",
      `Congratulations! Quotation Q-${quotation.id.slice(-4)} for ${quotation.clientName} has been won. Profit: ${quotation.currency} ${quotation.profit.toLocaleString()}`,
      'success',
      'Quotations',
      { 
        ...context, 
        priority: 'high',
        actionRequired: true,
        relatedId: quotation.id,
        relatedType: 'quotation'
      }
    )
  }, [addNotification])

  const notifyQuotationLost = useCallback((quotation: Quotation, context?: SystemNotificationContext) => {
    return addNotification(
      "😞 Quotation Lost",
      `Quotation Q-${quotation.id.slice(-4)} for ${quotation.clientName} has been marked as lost. Review for improvement opportunities.`,
      'error',
      'Quotations',
      { 
        ...context, 
        priority: 'medium',
        relatedId: quotation.id,
        relatedType: 'quotation'
      }
    )
  }, [addNotification])

  const notifyInvoiceCreated = useCallback((invoice: InvoiceData, context?: SystemNotificationContext) => {
    return addNotification(
      "💰 Invoice Generated",
      `Invoice ${invoice.invoiceNumber} has been successfully created${invoice.quotationId ? ` from quotation Q-${invoice.quotationId.slice(-4)}` : ''} for ${invoice.clientName}.`,
      'success',
      'Invoices',
      { 
        ...context, 
        priority: 'medium',
        actionRequired: true,
        relatedId: invoice.id,
        relatedType: 'invoice'
      }
    )
  }, [addNotification])

  const notifyInvoiceOverdue = useCallback((invoice: InvoiceData, daysPastDue: number, context?: SystemNotificationContext) => {
    return addNotification(
      "🚨 Invoice Overdue",
      `Invoice ${invoice.invoiceNumber} for ${invoice.clientName} is ${daysPastDue} days overdue. Amount: ${invoice.currency} ${invoice.totalAmount.toLocaleString()}`,
      'critical',
      'Invoices',
      { 
        ...context, 
        priority: 'critical',
        actionRequired: true,
        relatedId: invoice.id,
        relatedType: 'invoice'
      }
    )
  }, [addNotification])

  const notifyInvoicePaid = useCallback((invoice: InvoiceData, context?: SystemNotificationContext) => {
    return addNotification(
      "💸 Payment Received",
      `Invoice ${invoice.invoiceNumber} for ${invoice.clientName} has been paid. Amount: ${invoice.currency} ${invoice.totalAmount.toLocaleString()}`,
      'success',
      'Invoices',
      { 
        ...context, 
        priority: 'high',
        relatedId: invoice.id,
        relatedType: 'invoice'
      }
    )
  }, [addNotification])

  const notifyUserLogin = useCallback((user: User, context?: SystemNotificationContext) => {
    return addNotification(
      "🔐 User Login",
      `${user.name} (${user.role}) has logged into the system.`,
      'info',
      'Security',
      { 
        ...context, 
        priority: 'low',
        relatedId: user.id,
        relatedType: 'user'
      }
    )
  }, [addNotification])

  const notifyUserCreated = useCallback((user: User, context?: SystemNotificationContext) => {
    return addNotification(
      "👤 New User Added",
      `User ${user.name} (${user.role}) has been successfully created and added to the system.`,
      'success',
      'User Management',
      { 
        ...context, 
        priority: 'medium',
        relatedId: user.id,
        relatedType: 'user'
      }
    )
  }, [addNotification])

  const notifyUnauthorizedAccess = useCallback((resource: string, user?: User, context?: SystemNotificationContext) => {
    return addNotification(
      "🚫 Unauthorized Access Attempt",
      `Unauthorized attempt to access ${resource}${user ? ` by ${user.name}` : ''}. Security protocols activated.`,
      'critical',
      'Security',
      { 
        ...context, 
        priority: 'critical',
        actionRequired: true,
        relatedId: user?.id,
        relatedType: 'user'
      }
    )
  }, [addNotification])

  const notifySystemMaintenance = useCallback((message: string, scheduledTime?: string, context?: SystemNotificationContext) => {
    return addNotification(
      "🔧 System Maintenance",
      `${message}${scheduledTime ? ` Scheduled for: ${scheduledTime}` : ''}`,
      'warning',
      'System',
      { 
        ...context, 
        priority: 'high',
        actionRequired: true,
        relatedType: 'system'
      }
    )
  }, [addNotification])

  const notifyDataBackup = useCallback((success: boolean, backupType: string, context?: SystemNotificationContext) => {
    return addNotification(
      success ? "💾 Backup Completed" : "⚠️ Backup Failed",
      success 
        ? `${backupType} backup completed successfully. All data is secure.`
        : `${backupType} backup failed. Please check system status and retry.`,
      success ? 'success' : 'critical',
      'System',
      { 
        ...context, 
        priority: success ? 'medium' : 'critical',
        actionRequired: !success,
        relatedType: 'system'
      }
    )
  }, [addNotification])

  const notifyExportCompleted = useCallback((dataType: string, format: string, recordCount: number, context?: SystemNotificationContext) => {
    return addNotification(
      "📤 Export Completed",
      `Successfully exported ${recordCount} ${dataType} records to ${format} format.`,
      'success',
      'Data Operations',
      { 
        ...context, 
        priority: 'low',
        relatedType: 'system'
      }
    )
  }, [addNotification])

  const notifyPrintCompleted = useCallback((documentType: string, documentId: string, context?: SystemNotificationContext) => {
    return addNotification(
      "🖨️ Print Job Completed",
      `${documentType} ${documentId} has been prepared for printing and sent to the print queue.`,
      'success',
      'Document Management',
      { 
        ...context, 
        priority: 'low',
        relatedType: 'system'
      }
    )
  }, [addNotification])

  // Notification management functions
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }, [])

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Get critical notifications
  const criticalNotifications = notifications.filter(n => n.priority === 'critical' && !n.read)

  return {
    notifications,
    unreadCount,
    criticalNotifications,
    
    // Quotation notifications
    notifyQuotationCreated,
    notifyQuotationApproved,
    notifyQuotationRejected,
    notifyQuotationOverdue,
    notifyQuotationWon,
    notifyQuotationLost,
    
    // Invoice notifications
    notifyInvoiceCreated,
    notifyInvoiceOverdue,
    notifyInvoicePaid,
    
    // User notifications
    notifyUserLogin,
    notifyUserCreated,
    notifyUnauthorizedAccess,
    
    // System notifications
    notifySystemMaintenance,
    notifyDataBackup,
    notifyExportCompleted,
    notifyPrintCompleted,
    
    // Management functions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification, // For custom notifications
  }
}