import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InvoiceData } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseInvoices = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      // Fetch invoices with their items
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items(*)
        `)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      const formattedInvoices: InvoiceData[] = (invoicesData || []).map(invoice => ({
        id: invoice.id,
        quotationId: invoice.quotation_id,
        invoiceNumber: invoice.invoice_number,
        clientName: invoice.client_name,
        clientAddress: invoice.client_address || '',
        clientContactPerson: invoice.client_contact_person || '',
        clientTin: invoice.client_tin || '',
        destination: invoice.destination || '',
        doorDelivery: invoice.door_delivery || '',
        salesperson: invoice.salesperson || '',
        paymentConditions: invoice.payment_conditions || '',
        awbNumber: invoice.awb_number || '',
        currency: invoice.currency || 'USD',
        tva: invoice.tva || 0,
        subTotal: invoice.sub_total || 0,
        totalAmount: invoice.total_amount || 0,
        issueDate: invoice.issue_date,
        dueDate: invoice.due_date || invoice.issue_date,
        deliverDate: invoice.deliver_date || invoice.issue_date,
        validityDate: invoice.validity_date || invoice.issue_date,
        status: invoice.status as 'paid' | 'pending' | 'overdue',
        createdBy: invoice.created_by || '',
        createdAt: invoice.created_at,
        items: (invoice.invoice_items || []).map(item => ({
          id: item.id,
          commodity: item.commodity,
          quantityKg: item.quantity_kg,
          total: item.total,
          charges: [], // Initialize empty charges array
        })),
      }));

      setInvoices(formattedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch invoices. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoiceData: Omit<InvoiceData, 'id'>) => {
    try {
      // Check if an invoice already exists for this quotation
      if (invoiceData.quotationId) {
        const { data: existingInvoices, error: checkError } = await supabase
          .from('invoices')
          .select('id')
          .eq('quotation_id', invoiceData.quotationId);

        if (checkError) throw checkError;

        if (existingInvoices && existingInvoices.length > 0) {
          throw new Error('An invoice has already been generated for this quotation');
        }
      }

      // Insert invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          quotation_id: invoiceData.quotationId,
          invoice_number: invoiceData.invoiceNumber,
          client_name: invoiceData.clientName,
          client_address: invoiceData.clientAddress,
          client_contact_person: invoiceData.clientContactPerson,
          client_tin: invoiceData.clientTin,
          destination: invoiceData.destination,
          door_delivery: invoiceData.doorDelivery,
          salesperson: invoiceData.salesperson,
          payment_conditions: invoiceData.paymentConditions,
          awb_number: invoiceData.awbNumber,
          currency: invoiceData.currency,
          tva: invoiceData.tva,
          sub_total: invoiceData.subTotal,
          total_amount: invoiceData.totalAmount,
          issue_date: invoiceData.issueDate,
          due_date: invoiceData.dueDate,
          deliver_date: invoiceData.deliverDate,
          validity_date: invoiceData.validityDate,
          status: invoiceData.status,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Insert invoice items
      if (invoiceData.items && invoiceData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            invoiceData.items.map(item => ({
              invoice_id: invoice.id,
              commodity: item.commodity,
              quantity_kg: item.quantityKg,
              total: item.total,
            }))
          );

        if (itemsError) throw itemsError;
      }

      // Note: Invoice charges are handled separately if needed

      await fetchInvoices(); // Refresh the list
      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create invoice. Please try again.",
      });
      throw error;
    }
  };

  const updateInvoice = async (id: string, updates: Partial<InvoiceData>) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          quotation_id: updates.quotationId,
          invoice_number: updates.invoiceNumber,
          client_name: updates.clientName,
          client_address: updates.clientAddress,
          client_contact_person: updates.clientContactPerson,
          client_tin: updates.clientTin,
          destination: updates.destination,
          door_delivery: updates.doorDelivery,
          salesperson: updates.salesperson,
          payment_conditions: updates.paymentConditions,
          awb_number: updates.awbNumber,
          currency: updates.currency,
          tva: updates.tva,
          sub_total: updates.subTotal,
          total_amount: updates.totalAmount,
          issue_date: updates.issueDate,
          due_date: updates.dueDate,
          deliver_date: updates.deliverDate,
          validity_date: updates.validityDate,
          status: updates.status,
        })
        .eq('id', id);

      if (error) throw error;

      await fetchInvoices(); // Refresh the list
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update invoice. Please try again.",
      });
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchInvoices(); // Refresh the list
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    refetch: fetchInvoices,
  };
};