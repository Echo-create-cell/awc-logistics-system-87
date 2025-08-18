import { supabase } from '@/lib/supabase';
import { InvoiceData } from '@/types/invoice';

export const invoiceService = {
  async getAll(): Promise<InvoiceData[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }

    return data.map(row => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      quotationId: row.quotation_id,
      clientName: row.client_name,
      clientAddress: row.client_address,
      clientContactPerson: row.client_contact_person,
      clientTin: row.client_tin,
      destination: row.destination,
      doorDelivery: row.door_delivery,
      salesperson: row.salesperson,
      deliverDate: row.deliver_date,
      paymentConditions: row.payment_conditions,
      validityDate: row.validity_date,
      awbNumber: row.awb_number,
      items: row.items,
      subTotal: row.sub_total,
      tva: row.tva,
      totalAmount: row.total_amount,
      currency: row.currency,
      issueDate: row.issue_date,
      dueDate: row.due_date,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
    }));
  },

  async create(invoice: Omit<InvoiceData, 'id' | 'createdAt'>): Promise<InvoiceData> {
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoice.invoiceNumber,
        quotation_id: invoice.quotationId,
        client_name: invoice.clientName,
        client_address: invoice.clientAddress,
        client_contact_person: invoice.clientContactPerson,
        client_tin: invoice.clientTin,
        destination: invoice.destination,
        door_delivery: invoice.doorDelivery,
        salesperson: invoice.salesperson,
        deliver_date: invoice.deliverDate,
        payment_conditions: invoice.paymentConditions,
        validity_date: invoice.validityDate,
        awb_number: invoice.awbNumber,
        items: invoice.items,
        sub_total: invoice.subTotal,
        tva: invoice.tva,
        total_amount: invoice.totalAmount,
        currency: invoice.currency,
        issue_date: invoice.issueDate,
        due_date: invoice.dueDate,
        status: invoice.status,
        created_by: invoice.createdBy,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }

    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      quotationId: data.quotation_id,
      clientName: data.client_name,
      clientAddress: data.client_address,
      clientContactPerson: data.client_contact_person,
      clientTin: data.client_tin,
      destination: data.destination,
      doorDelivery: data.door_delivery,
      salesperson: data.salesperson,
      deliverDate: data.deliver_date,
      paymentConditions: data.payment_conditions,
      validityDate: data.validity_date,
      awbNumber: data.awb_number,
      items: data.items,
      subTotal: data.sub_total,
      tva: data.tva,
      totalAmount: data.total_amount,
      currency: data.currency,
      issueDate: data.issue_date,
      dueDate: data.due_date,
      status: data.status,
      createdBy: data.created_by,
      createdAt: data.created_at,
    };
  },

  async update(id: string, updates: Partial<InvoiceData>): Promise<InvoiceData> {
    const { data, error } = await supabase
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
        items: updates.items,
        sub_total: updates.subTotal,
        tva: updates.tva,
        total_amount: updates.totalAmount,
        currency: updates.currency,
        issue_date: updates.issueDate,
        due_date: updates.dueDate,
        status: updates.status,
        created_by: updates.createdBy,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }

    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      quotationId: data.quotation_id,
      clientName: data.client_name,
      clientAddress: data.client_address,
      clientContactPerson: data.client_contact_person,
      clientTin: data.client_tin,
      destination: data.destination,
      doorDelivery: data.door_delivery,
      salesperson: data.salesperson,
      deliverDate: data.deliver_date,
      paymentConditions: data.payment_conditions,
      validityDate: data.validity_date,
      awbNumber: data.awb_number,
      items: data.items,
      subTotal: data.sub_total,
      tva: data.tva,
      totalAmount: data.total_amount,
      currency: data.currency,
      issueDate: data.issue_date,
      dueDate: data.due_date,
      status: data.status,
      createdBy: data.created_by,
      createdAt: data.created_at,
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  },
};