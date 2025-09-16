import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InvoiceData } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseInvoices = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

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
          .select('id, invoice_number')
          .eq('quotation_id', invoiceData.quotationId);

        if (checkError) throw checkError;

        if (existingInvoices && existingInvoices.length > 0) {
          throw new Error(`Invoice #${existingInvoices[0].invoice_number} already exists for this quotation. Each quotation can only generate one invoice.`);
        }
      }

      // Get current user ID for created_by field
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('Authentication required to create invoices');
      if (!user) throw new Error('User not authenticated');

      // Insert invoice with proper error handling
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
          created_by: user.id, // Add the missing created_by field
        })
        .select()
        .single();

      if (invoiceError) {
        console.error('Invoice creation error:', invoiceError);
        if (invoiceError.code === '23505') {
          throw new Error('Invoice number already exists. Please try again.');
        }
        throw new Error(`Database error: ${invoiceError.message}`);
      }

      // Insert invoice items with batch processing
      if (invoiceData.items && invoiceData.items.length > 0) {
        const itemsToInsert = invoiceData.items.map(item => ({
          invoice_id: invoice.id,
          commodity: item.commodity,
          quantity_kg: item.quantityKg,
          total: item.total,
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('Invoice items creation error:', itemsError);
          // Cleanup: Delete the invoice if items couldn't be created
          await supabase.from('invoices').delete().eq('id', invoice.id);
          throw new Error('Failed to save invoice items. Invoice creation cancelled.');
        }

        // Insert invoice charges if they exist
        const chargesToInsert = [];
        for (const item of invoiceData.items) {
          if (item.charges && item.charges.length > 0) {
            for (const charge of item.charges) {
              chargesToInsert.push({
                invoice_item_id: item.id, // Note: This might need adjustment based on how items are handled
                description: charge.description,
                rate: charge.rate,
              });
            }
          }
        }

        if (chargesToInsert.length > 0) {
          const { error: chargesError } = await supabase
            .from('invoice_charges')
            .insert(chargesToInsert);

          if (chargesError) {
            console.warn('Invoice charges creation warning:', chargesError);
            // Don't fail the entire operation for charges, just log the warning
          }
        }
      }

      // Refresh the invoices list to show the new invoice
      await fetchInvoices();
      
      // Return success with invoice data
      return {
        ...invoice,
        success: true,
        message: `Invoice ${invoiceData.invoiceNumber} created successfully`
      };
    } catch (error) {
      console.error('Error creating invoice:', error);
      
      // Enhanced error handling with specific error types
      let errorMessage = "Failed to create invoice. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          errorMessage = error.message;
        } else if (error.message.includes('violates row-level security')) {
          errorMessage = "You don't have permission to create invoices. Please contact your administrator.";
        } else if (error.message.includes('Database error')) {
          errorMessage = error.message;
        } else {
          errorMessage = `Invoice creation failed: ${error.message}`;
        }
      }
      
      toast({
        variant: "destructive",
        title: "❌ Invoice Creation Failed",
        description: errorMessage,
      });
      
      throw new Error(errorMessage);
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
    // Only fetch data when auth is complete and user is logged in
    if (!authLoading) {
      if (user) {
        console.log('Fetching invoices for authenticated user:', user.email);
        fetchInvoices();
      } else {
        console.log('No user authenticated, clearing invoices');
        setInvoices([]);
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  return {
    invoices,
    loading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    refetch: fetchInvoices,
  };
};