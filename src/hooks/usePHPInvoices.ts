import { useState, useEffect } from 'react';
import { InvoiceData } from '@/types/invoice';
import { API_ENDPOINTS, apiFetch } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

export const usePHPInvoices = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchInvoices = async () => {
    if (!user) {
      console.log('No user authenticated, clearing invoices');
      setInvoices([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiFetch(API_ENDPOINTS.invoices);
      
      // Transform PHP response to match TypeScript interface
      const transformedData: InvoiceData[] = data.map((inv: any) => ({
        id: inv.id,
        quotationId: inv.quotation_id,
        invoiceNumber: inv.invoice_number,
        clientName: inv.client_name,
        clientAddress: inv.client_address,
        clientContactPerson: inv.client_contact_person,
        clientTin: inv.client_tin,
        destination: inv.destination,
        doorDelivery: inv.door_delivery,
        salesperson: inv.salesperson,
        deliverDate: inv.deliver_date,
        paymentConditions: inv.payment_conditions,
        validityDate: inv.validity_date,
        awbNumber: inv.awb_number,
        subTotal: parseFloat(inv.sub_total || 0),
        tva: parseFloat(inv.tva || 0),
        totalAmount: parseFloat(inv.total_amount),
        currency: inv.currency,
        issueDate: inv.issue_date,
        dueDate: inv.due_date,
        status: inv.status,
        items: inv.items ? inv.items.split('||').map((item: string) => {
          const [id, commodity, quantityKg, total] = item.split(':');
          return {
            id,
            commodity,
            quantityKg: parseFloat(quantityKg),
            total: parseFloat(total),
            charges: []
          };
        }) : []
      }));
      
      setInvoices(transformedData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoiceData: Omit<InvoiceData, 'id'>) => {
    try {
      await apiFetch(API_ENDPOINTS.invoices, {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      });
      await fetchInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  };

  const updateInvoice = async (id: string, updates: Partial<InvoiceData>) => {
    try {
      await apiFetch(API_ENDPOINTS.invoices, {
        method: 'PUT',
        body: JSON.stringify({ id, ...updates }),
      });
      await fetchInvoices();
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await apiFetch(`${API_ENDPOINTS.invoices}?id=${id}`, {
        method: 'DELETE',
      });
      await fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvoices();
    } else {
      setInvoices([]);
      setLoading(false);
    }
  }, [user]);

  return {
    invoices,
    loading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    refetch: fetchInvoices
  };
};
