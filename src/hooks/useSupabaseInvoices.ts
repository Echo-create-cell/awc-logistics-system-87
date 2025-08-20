import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InvoiceData } from '@/types/invoice';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseInvoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (
            *,
            invoice_charges (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      // Transform database data to match frontend interface
      const transformedInvoices: InvoiceData[] = (invoicesData || []).map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        quotationId: inv.quotation_id,
        clientName: inv.client_name,
        clientAddress: inv.client_address || '',
        clientContactPerson: inv.client_contact_person || '',
        clientTin: inv.client_tin || '',
        destination: inv.destination || '',
        doorDelivery: inv.door_delivery || '',
        salesperson: inv.salesperson || '',
        deliverDate: inv.deliver_date || '',
        paymentConditions: inv.payment_conditions || '',
        validityDate: inv.validity_date || '',
        awbNumber: inv.awb_number || '',
        items: (inv.invoice_items || []).map((item: any) => ({
          id: item.id,
          quantityKg: parseFloat(item.quantity_kg),
          commodity: item.commodity,
          charges: (item.invoice_charges || []).map((charge: any) => ({
            id: charge.id,
            description: charge.description,
            rate: parseFloat(charge.rate),
          })),
          total: parseFloat(item.total),
        })),
        subTotal: parseFloat(inv.sub_total || 0),
        tva: parseFloat(inv.tva || 0),
        totalAmount: parseFloat(inv.total_amount || 0),
        currency: inv.currency,
        issueDate: inv.issue_date,
        dueDate: inv.due_date,
        status: inv.status,
        createdBy: inv.created_by,
        createdAt: inv.created_at,
      }));

      setInvoices(transformedInvoices);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoiceData: Omit<InvoiceData, 'id' | 'createdAt'>) => {
    try {
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceData.invoiceNumber,
          quotation_id: invoiceData.quotationId,
          client_name: invoiceData.clientName,
          client_address: invoiceData.clientAddress,
          client_contact_person: invoiceData.clientContactPerson,
          client_tin: invoiceData.clientTin,
          destination: invoiceData.destination,
          door_delivery: invoiceData.doorDelivery,
          salesperson: invoiceData.salesperson,
          deliver_date: invoiceData.deliverDate,
          payment_conditions: invoiceData.paymentConditions,
          validity_date: invoiceData.validityDate,
          awb_number: invoiceData.awbNumber,
          sub_total: invoiceData.subTotal,
          tva: invoiceData.tva,
          total_amount: invoiceData.totalAmount,
          currency: invoiceData.currency,
          issue_date: invoiceData.issueDate,
          due_date: invoiceData.dueDate,
          status: invoiceData.status,
          created_by: user?.id,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Insert invoice items and charges
      if (invoiceData.items && invoiceData.items.length > 0) {
        for (const item of invoiceData.items) {
          const { data: newItem, error: itemError } = await supabase
            .from('invoice_items')
            .insert({
              invoice_id: newInvoice.id,
              quantity_kg: item.quantityKg,
              commodity: item.commodity,
              total: item.total,
            })
            .select()
            .single();

          if (itemError) throw itemError;

          // Insert charges for this item
          if (item.charges && item.charges.length > 0) {
            const chargeInserts = item.charges.map((charge) => ({
              invoice_item_id: newItem.id,
              description: charge.description,
              rate: charge.rate,
            }));

            const { error: chargesError } = await supabase
              .from('invoice_charges')
              .insert(chargeInserts);

            if (chargesError) throw chargesError;
          }
        }
      }

      await fetchInvoices();
      return newInvoice;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateInvoice = async (invoiceId: string, updates: Partial<InvoiceData>) => {
    try {
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          invoice_number: updates.invoiceNumber,
          quotation_id: updates.quotationId,
          client_name: updates.clientName,
          client_address: updates.clientAddress,
          client_contact_person: updates.clientContactPerson,
          client_tin: updates.clientTin,
          destination: updates.destination,
          door_delivery: updates.doorDelivery,
          salesperson: updates.salesperson,
          deliver_date: updates.deliverDate,
          payment_conditions: updates.paymentConditions,
          validity_date: updates.validityDate,
          awb_number: updates.awbNumber,
          sub_total: updates.subTotal,
          tva: updates.tva,
          total_amount: updates.totalAmount,
          currency: updates.currency,
          issue_date: updates.issueDate,
          due_date: updates.dueDate,
          status: updates.status,
        })
        .eq('id', invoiceId);

      if (invoiceError) throw invoiceError;

      await fetchInvoices();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  return {
    invoices,
    loading,
    error,
    createInvoice,
    updateInvoice,
    refetch: fetchInvoices,
  };
};