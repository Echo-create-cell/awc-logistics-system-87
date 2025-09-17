import { useEffect, useRef } from 'react'
import { useNotificationManager } from '@/hooks/useNotificationManager'
import { Quotation } from '@/types'
import { InvoiceData } from '@/types/invoice'
import { NOTIFICATIONS_ENABLED } from '@/config/features'


interface UseOverdueNotificationsProps {
  quotations: Quotation[]
  invoices: InvoiceData[]
  checkIntervalMinutes?: number
}

/**
 * Hook for managing overdue notifications
 * 
 * IMPORTANT: All overdue notifications are positioned in the same fixed location
 * (top-4 right-4) to prevent them from scattering across the screen.
 */
export const useOverdueNotifications = ({ 
  quotations, 
  invoices, 
  checkIntervalMinutes = 60 
}: UseOverdueNotificationsProps) => {
  const { notifyQuotationOverdue, notifyInvoiceOverdue } = useNotificationManager()
  const notifiedItems = useRef(new Set<string>())

  useEffect(() => {
    if (!NOTIFICATIONS_ENABLED) return
    
    const checkOverdueItems = () => {
      const now = new Date()

      // Check overdue quotations (follow-up dates) - positioned at top-4 right-4
      quotations.forEach(quotation => {
        if (quotation.status === 'pending' && quotation.followUpDate) {
          const followUpDate = new Date(quotation.followUpDate)
          const daysPastDue = Math.floor((now.getTime() - followUpDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysPastDue > 0) {
            const notificationKey = `quotation-${quotation.id}-overdue-${daysPastDue}`
            if (!notifiedItems.current.has(notificationKey)) {
              // Force overdue notification to same fixed position
              notifyQuotationOverdue(quotation, daysPastDue)
              notifiedItems.current.add(notificationKey)
            }
          }
        }
      })

      // Check overdue invoices - positioned at top-4 right-4
      invoices.forEach(invoice => {
        if (invoice.status === 'pending' && invoice.dueDate) {
          const dueDate = new Date(invoice.dueDate)
          const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysPastDue > 0) {
            const notificationKey = `invoice-${invoice.id}-overdue-${daysPastDue}`
            if (!notifiedItems.current.has(notificationKey)) {
              // Force overdue notification to same fixed position  
              notifyInvoiceOverdue(invoice, daysPastDue)
              notifiedItems.current.add(notificationKey)
            }
          }
        }
      })
    }

    // Set up interval to check periodically (don't check immediately to prevent loops)
    const interval = setInterval(checkOverdueItems, checkIntervalMinutes * 60 * 1000)

    return () => clearInterval(interval)
  }, [quotations.length, invoices.length, checkIntervalMinutes])
}