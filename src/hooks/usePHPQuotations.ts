import { useState, useEffect } from 'react';
import { Quotation } from '@/types';
import { API_ENDPOINTS, apiFetch } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

export const usePHPQuotations = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchQuotations = async () => {
    if (!user) {
      console.log('No user authenticated, clearing quotations');
      setQuotations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiFetch(API_ENDPOINTS.quotations);
      
      // Transform PHP response to match TypeScript interface
      const transformedData: Quotation[] = data.map((q: any) => ({
        id: q.id,
        clientId: q.client_id,
        clientName: q.client_name,
        volume: q.volume,
        buyRate: parseFloat(q.buy_rate),
        currency: q.currency,
        clientQuote: parseFloat(q.client_quote),
        profit: parseFloat(q.profit),
        profitPercentage: q.profit_percentage,
        quoteSentBy: q.quote_sent_by_name || q.quote_sent_by,
        status: q.status,
        followUpDate: q.follow_up_date,
        remarks: q.remarks,
        createdAt: q.created_at,
        approvedBy: q.approved_by,
        approvedAt: q.approved_at,
        destination: q.destination,
        doorDelivery: q.door_delivery,
        freightMode: q.freight_mode,
        cargoDescription: q.cargo_description,
        requestType: q.request_type,
        countryOfOrigin: q.country_of_origin,
        totalVolumeKg: parseFloat(q.total_volume_kg || 0)
      }));
      
      setQuotations(transformedData);
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createQuotation = async (quotationData: Omit<Quotation, 'id' | 'createdAt'>) => {
    try {
      await apiFetch(API_ENDPOINTS.quotations, {
        method: 'POST',
        body: JSON.stringify(quotationData),
      });
      await fetchQuotations();
    } catch (error) {
      console.error('Error creating quotation:', error);
      throw error;
    }
  };

  const updateQuotation = async (id: string, updates: Partial<Quotation>) => {
    try {
      await apiFetch(API_ENDPOINTS.quotations, {
        method: 'PUT',
        body: JSON.stringify({ id, ...updates }),
      });
      await fetchQuotations();
    } catch (error) {
      console.error('Error updating quotation:', error);
      throw error;
    }
  };

  const deleteQuotation = async (id: string) => {
    try {
      await apiFetch(`${API_ENDPOINTS.quotations}?id=${id}`, {
        method: 'DELETE',
      });
      await fetchQuotations();
    } catch (error) {
      console.error('Error deleting quotation:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchQuotations();
    } else {
      setQuotations([]);
      setLoading(false);
    }
  }, [user]);

  return {
    quotations,
    loading,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    refetch: fetchQuotations
  };
};
