import { useEffect } from 'react'
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
            notifyQuotationOverdue(quotation, daysPastDue)
          }
        }
      })

      // Check overdue invoices
      invoices.forEach(invoice => {
        if (invoice.status === 'pending' && invoice.dueDate) {
          const dueDate = new Date(invoice.dueDate)
          const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysPastDue > 0) {
            notifyInvoiceOverdue(invoice, daysPastDue)
          }
        }
      })
    }

    // Check immediately
    checkOverdueItems()

    // Set up interval to check periodically
    const interval = setInterval(checkOverdueItems, checkIntervalMinutes * 60 * 1000)

    return () => clearInterval(interval)
  }, [quotations, invoices, checkIntervalMinutes, notifyQuotationOverdue, notifyInvoiceOverdue])
}