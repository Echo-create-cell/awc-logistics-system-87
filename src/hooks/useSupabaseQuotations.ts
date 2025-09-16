import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Quotation } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseQuotations = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          quotation_commodities(*),
          invoices(id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedQuotations: Quotation[] = (data || []).map(item => {
        // Format commodities data for backward compatibility
        const commoditiesData = item.quotation_commodities || [];
        const volumeData = commoditiesData.length > 0 
          ? JSON.stringify(commoditiesData.map(c => ({
              id: c.id,
              name: c.name,
              quantityKg: c.quantity_kg,
              rate: c.rate,
              clientRate: c.client_rate,
            })))
          : item.total_volume_kg?.toString() || '0';

        return {
          id: item.id,
          clientId: item.client_id,
          clientName: item.client_name || '',
          volume: volumeData,
          buyRate: item.buy_rate || 0,
          currency: item.currency || 'USD',
          clientQuote: item.client_quote || 0,
          profit: item.profit || 0,
          profitPercentage: item.profit_percentage || '0.0',
          quoteSentBy: item.quote_sent_by || '',
          status: item.status as 'won' | 'lost' | 'pending',
          followUpDate: item.follow_up_date || new Date().toISOString().split('T')[0],
          remarks: item.remarks || '',
          createdAt: item.created_at,
          approvedBy: item.approved_by,
          approvedAt: item.approved_at,
          destination: item.destination,
          doorDelivery: item.door_delivery,
          freightMode: item.freight_mode as 'Air Freight' | 'Sea Freight' | 'Road Freight',
          cargoDescription: item.cargo_description,
          requestType: item.request_type as 'Import' | 'Export' | 'Re-Import' | 'Project' | 'Local',
          countryOfOrigin: item.country_of_origin,
          totalVolumeKg: item.total_volume_kg,
          linkedInvoiceIds: (item.invoices || []).map((inv: any) => inv.id),
        };
      });

      setQuotations(formattedQuotations);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch quotations. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const createQuotation = async (quotationData: Omit<Quotation, 'id' | 'createdAt'>) => {
    try {
      console.log('Creating quotation with data:', quotationData);
      
      // Get current authenticated user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', session);
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication session error');
      }
      
      if (!session?.user) {
        console.error('No authenticated user found');
        throw new Error('User must be authenticated to create quotations');
      }

      console.log('Authenticated user ID:', session.user.id);

      // Parse commodities data
      let commodities = [];
      let totalVolume = 0;
      
      try {
        if (quotationData.volume) {
          commodities = JSON.parse(quotationData.volume);
          if (Array.isArray(commodities)) {
            totalVolume = commodities.reduce((sum, c) => sum + (Number(c.quantityKg) || 0), 0);
          }
        }
      } catch (parseError) {
        console.warn('Could not parse commodities, using fallback:', parseError);
        totalVolume = Number(quotationData.volume) || 0;
      }

      console.log('Processed commodities:', commodities);
      console.log('Total volume:', totalVolume);

      const quotationPayload = {
        client_id: quotationData.clientId,
        client_name: quotationData.clientName,
        total_volume_kg: totalVolume,
        buy_rate: quotationData.buyRate || 0,
        currency: quotationData.currency || 'USD',
        client_quote: quotationData.clientQuote || 0,
        profit: quotationData.profit || 0,
        profit_percentage: quotationData.profitPercentage || '0.0%',
        quote_sent_by: quotationData.quoteSentBy,
        status: quotationData.status || 'pending',
        follow_up_date: quotationData.followUpDate,
        remarks: quotationData.remarks,
        destination: quotationData.destination,
        door_delivery: quotationData.doorDelivery,
        freight_mode: quotationData.freightMode,
        cargo_description: quotationData.cargoDescription,
        request_type: quotationData.requestType,
        country_of_origin: quotationData.countryOfOrigin,
        created_by: session.user.id, // CRITICAL: Set the created_by field for RLS
      };

      console.log('Final quotation payload:', quotationPayload);

      const { data, error } = await supabase
        .from('quotations')
        .insert(quotationPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('Quotation created successfully:', data);

      // Save commodities to quotation_commodities table if we have valid commodities
      if (Array.isArray(commodities) && commodities.length > 0) {
        console.log('Saving commodities:', commodities);
        
        const { error: commoditiesError } = await supabase
          .from('quotation_commodities')
          .insert(
            commodities.map(commodity => ({
              quotation_id: data.id,
              name: commodity.name || '',
              quantity_kg: Number(commodity.quantityKg) || 0,
              rate: Number(commodity.rate) || 0,
              client_rate: Number(commodity.clientRate) || 0,
            }))
          );

        if (commoditiesError) {
          console.error('Failed to save commodities:', commoditiesError);
          // Don't throw here - quotation is already saved
        } else {
          console.log('Commodities saved successfully');
        }
      }

      // Refresh the quotations list
      await fetchQuotations();
      return data;
    } catch (error) {
      console.error('Error creating quotation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create quotation. Please try again.",
      });
      throw error;
    }
  };

  const updateQuotation = async (id: string, updates: Partial<Quotation>) => {
    try {
      const { error } = await supabase
        .from('quotations')
        .update({
          client_id: updates.clientId,
          client_name: updates.clientName,
          total_volume_kg: updates.volume ? parseFloat(updates.volume) : undefined,
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
        })
        .eq('id', id);

      if (error) throw error;

      // Update commodities if volume data is provided
      if (updates.volume) {
        try {
          const commodities = JSON.parse(updates.volume);
          if (Array.isArray(commodities)) {
            // Delete existing commodities for this quotation
            await supabase
              .from('quotation_commodities')
              .delete()
              .eq('quotation_id', id);

            // Insert updated commodities
            if (commodities.length > 0) {
              const { error: commoditiesError } = await supabase
                .from('quotation_commodities')
                .insert(
                  commodities.map(commodity => ({
                    quotation_id: id,
                    name: commodity.name,
                    quantity_kg: commodity.quantityKg,
                    rate: commodity.rate || 0,
                    client_rate: commodity.clientRate || 0,
                  }))
                );

              if (commoditiesError) {
                console.warn('Warning: Failed to update commodities:', commoditiesError);
              }
            }
          }
        } catch (parseError) {
          console.warn('Warning: Could not parse commodities data during update:', parseError);
        }
      }

      await fetchQuotations(); // Refresh the list
    } catch (error) {
      console.error('Error updating quotation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quotation. Please try again.",
      });
      throw error;
    }
  };

  const deleteQuotation = async (id: string) => {
    try {
      // Delete associated commodities first (foreign key constraint)
      await supabase
        .from('quotation_commodities')
        .delete()
        .eq('quotation_id', id);

      // Then delete the quotation
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchQuotations(); // Refresh the list
    } catch (error) {
      console.error('Error deleting quotation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete quotation. Please try again.",
      });
      throw error;
    }
  };

  useEffect(() => {
    // Only fetch data when auth is complete and user is logged in
    if (!authLoading) {
      if (user) {
        console.log('Fetching quotations for authenticated user:', user.email);
        fetchQuotations();
      } else {
        console.log('No user authenticated, clearing quotations');
        setQuotations([]);
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  return {
    quotations,
    loading,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    refetch: fetchQuotations,
  };
};
