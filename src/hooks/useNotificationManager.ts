import { useAuth } from '@/contexts/AuthContext'
import { useSystemNotifications } from './useSystemNotifications'
import { Quotation, User } from '@/types'
import { InvoiceData } from '@/types/invoice'
import { SystemNotificationContext } from './useSystemNotifications'

export const useNotificationManager = () => {
  const { user } = useAuth()
  const notifications = useSystemNotifications()

  // Wrapper functions (notifications visible to all roles)
  const notifyQuotationCreated = (quotation: Quotation, context?: SystemNotificationContext) => {
    return notifications.notifyQuotationCreated(quotation, context)
  }

  const notifyQuotationApproved = (quotation: Quotation, context?: SystemNotificationContext) => {
    return notifications.notifyQuotationApproved(quotation, context)
  }

  const notifyQuotationRejected = (quotation: Quotation, reason: string, context?: SystemNotificationContext) => {
    return notifications.notifyQuotationRejected(quotation, reason, context)
  }

  const notifyQuotationOverdue = (quotation: Quotation, daysPastDue: number, context?: SystemNotificationContext) => {
    return notifications.notifyQuotationOverdue(quotation, daysPastDue, context)
  }

  const notifyQuotationWon = (quotation: Quotation, context?: SystemNotificationContext) => {
    return notifications.notifyQuotationWon(quotation, context)
  }

  const notifyQuotationLost = (quotation: Quotation, context?: SystemNotificationContext) => {
    return notifications.notifyQuotationLost(quotation, context)
  }

  const notifyInvoiceCreated = (invoice: InvoiceData, context?: SystemNotificationContext) => {
    return notifications.notifyInvoiceCreated(invoice, context)
  }

  const notifyInvoiceOverdue = (invoice: InvoiceData, daysPastDue: number, context?: SystemNotificationContext) => {
    return notifications.notifyInvoiceOverdue(invoice, daysPastDue, context)
  }

  const notifyInvoicePaid = (invoice: InvoiceData, context?: SystemNotificationContext) => {
    return notifications.notifyInvoicePaid(invoice, context)
  }

  // Return all notification functions with role filtering applied
  return {
    ...notifications,
    notifyQuotationCreated,
    notifyQuotationApproved,
    notifyQuotationRejected,
    notifyQuotationOverdue,
    notifyQuotationWon,
    notifyQuotationLost,
    notifyInvoiceCreated,
    notifyInvoiceOverdue,
    notifyInvoicePaid,
  }
}