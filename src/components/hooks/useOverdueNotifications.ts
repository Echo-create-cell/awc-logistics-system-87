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

      // Check overdue quotations (follow-up dates)
      quotations.forEach(quotation => {
        if (quotation.status === 'pending' && quotation.followUpDate) {
          const followUpDate = new Date(quotation.followUpDate)
          const daysPastDue = Math.floor((now.getTime() - followUpDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysPastDue > 0) {
            const notificationKey = `quotation-${quotation.id}-overdue-${daysPastDue}`
            if (!notifiedItems.current.has(notificationKey)) {
              notifyQuotationOverdue(quotation, daysPastDue)
              notifiedItems.current.add(notificationKey)
            }
          }
        }
      })

      // Check overdue invoices
      invoices.forEach(invoice => {
        if (invoice.status === 'pending' && invoice.dueDate) {
          const dueDate = new Date(invoice.dueDate)
          const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysPastDue > 0) {
            const notificationKey = `invoice-${invoice.id}-overdue-${daysPastDue}`
            if (!notifiedItems.current.has(notificationKey)) {
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