import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface DatabaseClient {
  id: string;
  company_name: string;
  contact_person: string | null;
  tin_number: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  created_by: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export const useSupabaseClients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      // Transform database data to match frontend interface
      const transformedClients: Client[] = (clientsData || []).map((c: DatabaseClient) => ({
        id: c.id,
        companyName: c.company_name,
        contactPerson: c.contact_person || '',
        tinNumber: c.tin_number || '',
        address: c.address || '',
        city: c.city || '',
        country: c.country || '',
        phone: c.phone || '',
        email: c.email || '',
      }));

      setClients(transformedClients);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: Omit<Client, 'id'>) => {
    try {
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          company_name: clientData.companyName,
          contact_person: clientData.contactPerson,
          tin_number: clientData.tinNumber,
          address: clientData.address,
          city: clientData.city,
          country: clientData.country,
          phone: clientData.phone,
          email: clientData.email,
          created_by: user?.id,
        })
        .select()
        .single();

      if (clientError) throw clientError;

      await fetchClients();
      return newClient;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    try {
      const { error: clientError } = await supabase
        .from('clients')
        .update({
          company_name: updates.companyName,
          contact_person: updates.contactPerson,
          tin_number: updates.tinNumber,
          address: updates.address,
          city: updates.city,
          country: updates.country,
          phone: updates.phone,
          email: updates.email,
        })
        .eq('id', clientId);

      if (clientError) throw clientError;

      await fetchClients();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      const { error: clientError } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (clientError) throw clientError;

      await fetchClients();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    refetch: fetchClients,
  };
};