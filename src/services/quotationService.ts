import { supabase } from '@/lib/supabase';
import { Quotation } from '@/types';

export const quotationService = {
  async getAll(): Promise<Quotation[]> {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotations:', error);
      throw error;
    }

    return data.map(row => ({
      id: row.id,
      clientId: row.client_id || '',
      clientName: row.client_name || '',
      volume: row.volume || '',
      buyRate: row.buy_rate || 0,
      currency: row.currency || 'USD',
      clientQuote: row.client_quote || 0,
      profit: row.profit || 0,
      profitPercentage: row.profit_percentage || '0%',
      quoteSentBy: row.quote_sent_by || '',
      status: row.status,
      followUpDate: row.follow_up_date || '',
      remarks: row.remarks || '',
      createdAt: row.created_at,
      approvedBy: row.approved_by || '',
      approvedAt: row.approved_at || '',
      destination: row.destination || '',
      doorDelivery: row.door_delivery || '',
      linkedInvoiceIds: row.linked_invoice_ids || [],
      freightMode: row.freight_mode || '',
      cargoDescription: row.cargo_description || '',
      requestType: row.request_type || '',
      countryOfOrigin: row.country_of_origin || '',
      totalVolumeKg: row.total_volume_kg || 0,
    }));
  },

  async create(quotation: Omit<Quotation, 'id' | 'createdAt'>): Promise<Quotation> {
    const { data, error } = await supabase
      .from('quotations')
      .insert({
        client_id: quotation.clientId,
        client_name: quotation.clientName,
        volume: quotation.volume,
        buy_rate: quotation.buyRate,
        currency: quotation.currency,
        client_quote: quotation.clientQuote,
        profit: quotation.profit,
        profit_percentage: quotation.profitPercentage,
        quote_sent_by: quotation.quoteSentBy,
        status: quotation.status,
        follow_up_date: quotation.followUpDate,
        remarks: quotation.remarks,
        approved_by: quotation.approvedBy,
        approved_at: quotation.approvedAt,
        destination: quotation.destination,
        door_delivery: quotation.doorDelivery,
        linked_invoice_ids: quotation.linkedInvoiceIds,
        freight_mode: quotation.freightMode,
        cargo_description: quotation.cargoDescription,
        request_type: quotation.requestType,
        country_of_origin: quotation.countryOfOrigin,
        total_volume_kg: quotation.totalVolumeKg,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating quotation:', error);
      throw error;
    }

    return {
      id: data.id,
      clientId: data.client_id,
      clientName: data.client_name,
      volume: data.volume,
      buyRate: data.buy_rate,
      currency: data.currency,
      clientQuote: data.client_quote,
      profit: data.profit,
      profitPercentage: data.profit_percentage,
      quoteSentBy: data.quote_sent_by,
      status: data.status,
      followUpDate: data.follow_up_date,
      remarks: data.remarks,
      createdAt: data.created_at,
      approvedBy: data.approved_by,
      approvedAt: data.approved_at,
      destination: data.destination,
      doorDelivery: data.door_delivery,
      linkedInvoiceIds: data.linked_invoice_ids || [],
      freightMode: data.freight_mode,
      cargoDescription: data.cargo_description,
      requestType: data.request_type,
      countryOfOrigin: data.country_of_origin,
      totalVolumeKg: data.total_volume_kg,
    };
  },

  async update(id: string, updates: Partial<Quotation>): Promise<Quotation> {
    const { data, error } = await supabase
      .from('quotations')
      .update({
        client_id: updates.clientId,
        client_name: updates.clientName,
        volume: updates.volume,
        buy_rate: updates.buyRate,
        currency: updates.currency,
        client_quote: updates.clientQuote,
        profit: updates.profit,
        profit_percentage: updates.profitPercentage,
        quote_sent_by: updates.quoteSentBy,
        status: updates.status,
        follow_up_date: updates.followUpDate,
        remarks: updates.remarks,
        approved_by: updates.approvedBy,
        approved_at: updates.approvedAt,
        destination: updates.destination,
        door_delivery: updates.doorDelivery,
        linked_invoice_ids: updates.linkedInvoiceIds,
        freight_mode: updates.freightMode,
        cargo_description: updates.cargoDescription,
        request_type: updates.requestType,
        country_of_origin: updates.countryOfOrigin,
        total_volume_kg: updates.totalVolumeKg,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating quotation:', error);
      throw error;
    }

    return {
      id: data.id,
      clientId: data.client_id,
      clientName: data.client_name,
      volume: data.volume,
      buyRate: data.buy_rate,
      currency: data.currency,
      clientQuote: data.client_quote,
      profit: data.profit,
      profitPercentage: data.profit_percentage,
      quoteSentBy: data.quote_sent_by,
      status: data.status,
      followUpDate: data.follow_up_date,
      remarks: data.remarks,
      createdAt: data.created_at,
      approvedBy: data.approved_by,
      approvedAt: data.approved_at,
      destination: data.destination,
      doorDelivery: data.door_delivery,
      linkedInvoiceIds: data.linked_invoice_ids || [],
      freightMode: data.freight_mode,
      cargoDescription: data.cargo_description,
      requestType: data.request_type,
      countryOfOrigin: data.country_of_origin,
      totalVolumeKg: data.total_volume_kg,
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting quotation:', error);
      throw error;
    }
  },
};