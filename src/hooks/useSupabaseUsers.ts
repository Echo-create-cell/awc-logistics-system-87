import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Transform database data to match frontend interface
      const transformedUsers: User[] = (usersData || []).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.created_at,
      }));

      setUsers(transformedUsers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      // Note: Admin user creation requires proper authentication setup
      // For now, we'll create the profile directly and let auth be handled separately
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: currentUser?.id, // This will need to be updated when auth is implemented
          name: userData.name,
          email: userData.email,
          role: userData.role,
          status: userData.status,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      await fetchUsers();
      return newProfile;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          email: updates.email,
          role: updates.role,
          status: updates.status,
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      await fetchUsers();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Delete the profile (this will cascade to auth.users due to foreign key)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      await fetchUsers();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
};