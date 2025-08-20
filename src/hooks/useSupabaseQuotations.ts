import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Quotation } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseQuotations = () => {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const { data: quotationsData, error: quotationsError } = await supabase
        .from('quotations')
        .select(`
          *,
          quotation_commodities (*)
        `)
        .order('created_at', { ascending: false });

      if (quotationsError) throw quotationsError;

      // Transform database data to match frontend interface
      const transformedQuotations: Quotation[] = (quotationsData || []).map((q: any) => ({
        id: q.id,
        clientId: q.client_id,
        clientName: q.client_name,
        volume: JSON.stringify(q.quotation_commodities || []),
        buyRate: parseFloat(q.buy_rate || 0),
        currency: q.currency,
        clientQuote: parseFloat(q.client_quote || 0),
        profit: parseFloat(q.profit || 0),
        profitPercentage: q.profit_percentage,
        quoteSentBy: q.quote_sent_by,
        status: q.status,
        followUpDate: q.follow_up_date,
        remarks: q.remarks || '',
        createdAt: q.created_at,
        approvedBy: q.approved_by,
        approvedAt: q.approved_at,
        destination: q.destination,
        doorDelivery: q.door_delivery,
        freightMode: q.freight_mode,
        cargoDescription: q.cargo_description,
        requestType: q.request_type,
        countryOfOrigin: q.country_of_origin,
        totalVolumeKg: parseFloat(q.total_volume_kg || 0),
      }));

      setQuotations(transformedQuotations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createQuotation = async (quotationData: Omit<Quotation, 'id' | 'createdAt'>) => {
    try {
      const { data: newQuotation, error: quotationError } = await supabase
        .from('quotations')
        .insert({
          client_id: quotationData.clientId,
          client_name: quotationData.clientName,
          buy_rate: quotationData.buyRate,
          currency: quotationData.currency,
          client_quote: quotationData.clientQuote,
          profit: quotationData.profit,
          profit_percentage: quotationData.profitPercentage,
          quote_sent_by: quotationData.quoteSentBy,
          status: quotationData.status,
          follow_up_date: quotationData.followUpDate,
          remarks: quotationData.remarks,
          destination: quotationData.destination,
          door_delivery: quotationData.doorDelivery,
          freight_mode: quotationData.freightMode,
          cargo_description: quotationData.cargoDescription,
          request_type: quotationData.requestType,
          country_of_origin: quotationData.countryOfOrigin,
          total_volume_kg: quotationData.totalVolumeKg,
          created_by: user?.id,
        })
        .select()
        .single();

      if (quotationError) throw quotationError;

      // Insert commodities if volume data exists
      if (quotationData.volume) {
        try {
          const commodities = JSON.parse(quotationData.volume);
          if (Array.isArray(commodities) && commodities.length > 0) {
            const commodityInserts = commodities.map((commodity: any) => ({
              quotation_id: newQuotation.id,
              name: commodity.name,
              quantity_kg: commodity.quantityKg,
              rate: commodity.rate || 0,
              client_rate: commodity.clientRate || 0,
            }));

            await supabase.from('quotation_commodities').insert(commodityInserts);
          }
        } catch (parseError) {
          console.warn('Failed to parse quotation volume data:', parseError);
        }
      }

      await fetchQuotations();
      return newQuotation;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateQuotation = async (quotationId: string, updates: Partial<Quotation>) => {
    try {
      const { error: quotationError } = await supabase
        .from('quotations')
        .update({
          client_id: updates.clientId,
          client_name: updates.clientName,
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
          freight_mode: updates.freightMode,
          cargo_description: updates.cargoDescription,
          request_type: updates.requestType,
          country_of_origin: updates.countryOfOrigin,
          total_volume_kg: updates.totalVolumeKg,
        })
        .eq('id', quotationId);

      if (quotationError) throw quotationError;

      await fetchQuotations();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchQuotations();
    }
  }, [user]);

  return {
    quotations,
    loading,
    error,
    createQuotation,
    updateQuotation,
    refetch: fetchQuotations,
  };
};