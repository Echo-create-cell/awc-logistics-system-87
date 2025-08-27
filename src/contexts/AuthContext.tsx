import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  users: User[];
  addUser: (newUser: User) => void;
  updateUser: (userId: string, updatedUser: User) => void;
  removeUser: (userId: string) => void;
  updateUserCredentials: (email: string, password: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - in real app this would come from backend
const mockUsers: User[] = [
  {
    id: '1',
    name: 'N. SOLANGE',
    email: 'n.solange@africaworldcargo.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'I. ARNOLD',
    email: 'i.arnold@africaworldcargo.com',
    role: 'sales_director',
    status: 'active',
    createdAt: '2024-02-01'
  },
  {
    id: '3',
    name: 'A. BENON',
    email: 'a.benon@africaworldcargo.com',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-02-15'
  },
  {
    id: '4',
    name: 'N. MARIEMERCI',
    email: 'n.mariemerci@africaworldcargo.com',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-03-01'
  },
  {
    id: '5',
    name: 'U. EPIPHANIE',
    email: 'u.epiphanie@africaworldcargo.com',
    role: 'finance_officer',
    status: 'active',
    createdAt: '2024-03-05'
  },
  {
    id: '6',
    name: 'K. PETER',
    email: 'k.peter@africaworldcargo.com',
    role: 'partner',
    status: 'active',
    createdAt: '2024-03-10'
  }
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [userCredentials, setUserCredentials] = useState<Record<string, string>>(() => {
    // Initialize with specific credentials matching provided user credentials
    const credentials: Record<string, string> = {
      'n.solange@africaworldcargo.com': 'Action@AWC',
      'i.arnold@africaworldcargo.com': 'Director@AWC',
      'a.benon@africaworldcargo.com': 'Sales1@AWC',
      'n.mariemerci@africaworldcargo.com': 'Sales2@AWC',
      'u.epiphanie@africaworldcargo.com': 'Finance@AWC',
      'k.peter@africaworldcargo.com': 'Peter@AWC'
    };
    return credentials;
  });
  const { notifyLoginSuccess, notifyLoginFailed, notifyLogout } = useNotifications();

  const establishSupabaseSession = async (email: string, password: string) => {
    try {
      console.log('Establishing Supabase session for email:', email);
      
      // Sign in with the actual user email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        console.error('Failed to sign in user:', error);
        throw error;
      }

      console.log('User signed in successfully:', data);
      return true;
    } catch (error) {
      console.error('Failed to establish Supabase session:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth...');
      
      // Check for existing Supabase session first
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session?.user && !error) {
        // Get user profile from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile) {
          const user: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            status: profile.status,
            createdAt: profile.created_at
          };
          setUser(user);
          localStorage.setItem('awc_user', JSON.stringify(user));
          console.log('Auth initialization complete - user restored from Supabase session');
        }
      } else {
        console.log('No active Supabase session found');
        localStorage.removeItem('awc_user');
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting to login with email:', email);
      
      // Sign in directly with Supabase using real credentials
      const sessionEstablished = await establishSupabaseSession(email, password);
      
      if (sessionEstablished) {
        // Get the user profile from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (profileError) {
            throw new Error('Failed to fetch user profile');
          }
          
          const user: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            status: profile.status,
            createdAt: profile.created_at
          };
          
          setUser(user);
          localStorage.setItem('awc_user', JSON.stringify(user));
          notifyLoginSuccess(user);
          setIsLoading(false);
          return true;
        }
      }
      
      throw new Error('Authentication failed');
    } catch (error) {
      console.error('Authentication error:', error);
      notifyLoginFailed("Invalid email or password. Please try again.");
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    const currentUser = user;
    
    // Sign out from Supabase
    try {
      await supabase.auth.signOut();
      console.log('Supabase sign out successful');
    } catch (error) {
      console.error('Supabase signout error:', error);
    }
    
    setUser(null);
    localStorage.removeItem('awc_user');
    if (currentUser) {
      notifyLogout(currentUser.name);
    }
  };

  const addUser = (newUser: User) => {
    setUsers(prev => [newUser, ...prev]);
    setUserCredentials(prev => ({
      ...prev,
      [newUser.email]: 'password' // Default password for new users
    }));
  };

  const updateUser = (userId: string, updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    
    // If user is currently logged in and gets updated, update the session
    if (user?.id === userId) {
      setUser(updatedUser);
      localStorage.setItem('awc_user', JSON.stringify(updatedUser));
    }
  };

  const removeUser = (userId: string) => {
    const userToRemove = users.find(u => u.id === userId);
    if (userToRemove) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      setUserCredentials(prev => {
        const { [userToRemove.email]: _, ...rest } = prev;
        return rest;
      });
      
      // If the removed user is currently logged in, log them out
      if (user?.id === userId) {
        logout();
      }
    }
  };

  const updateUserCredentials = (email: string, password: string) => {
    setUserCredentials(prev => ({
      ...prev,
      [email]: password
    }));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      users, 
      addUser, 
      updateUser, 
      removeUser, 
      updateUserCredentials 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
