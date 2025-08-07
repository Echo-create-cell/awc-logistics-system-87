import { useEffect } from 'react'
import { useSystemNotifications } from '@/hooks/useSystemNotifications'
import { Quotation } from '@/types'
import { InvoiceData } from '@/types/invoice'

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
  const { notifyQuotationOverdue, notifyInvoiceOverdue } = useSystemNotifications()

  useEffect(() => {
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