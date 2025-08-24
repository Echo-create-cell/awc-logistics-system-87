
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
      'a.benon@africaworldcargo.com': 'Agent@AWC',
      'n.mariemerci@africaworldcargo.com': 'Agent2@AWC',
      'u.epiphanie@africaworldcargo.com': 'Finance@AWC',
      'k.peter@africaworldcargo.com': 'Partner@AWC'
    };
    return credentials;
  });
  const { notifyLoginSuccess, notifyLoginFailed, notifyLogout } = useNotifications();

  useEffect(() => {
    const initializeAuth = async () => {
      // Check for stored user session
      const storedUser = localStorage.getItem('awc_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUser(user);
        
        // Restore Supabase authentication session
        try {
          const { data, error } = await supabase.auth.signInAnonymously();
          
          if (!error && data.user) {
            // Update/create profile in Supabase
            await supabase
              .from('profiles')
              .upsert({
                user_id: data.user.id,
                name: user.name,
                email: user.email,
                role: user.role as any,
                status: user.status as any,
              });
          }
        } catch (error) {
          console.warn('Failed to restore Supabase session:', error);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check against current users with their stored credentials
    const foundUser = users.find(u => u.email === email && u.status === 'active');
    const storedPassword = userCredentials[email] || 'password';
    
    if (foundUser && password === storedPassword) {
      try {
        // Authenticate with Supabase using the user's email
        // This creates a session for database operations
        const { data, error } = await supabase.auth.signInAnonymously();
        
        if (error) {
          console.error('Supabase auth error:', error);
          throw error;
        }

        // Create or update user profile in Supabase
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: data.user.id,
              name: foundUser.name,
              email: foundUser.email,
              role: foundUser.role as any,
              status: foundUser.status as any,
            })
            .select()
            .single();

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't fail login if profile creation fails
          }
        }

        setUser(foundUser);
        localStorage.setItem('awc_user', JSON.stringify(foundUser));
        notifyLoginSuccess(foundUser);
        setIsLoading(false);
        return true;
      } catch (error) {
        console.error('Authentication error:', error);
        notifyLoginFailed("Authentication failed. Please try again.");
        setIsLoading(false);
        return false;
      }
    }
    
    notifyLoginFailed("Invalid email or password. Please try again.");
    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    const currentUser = user;
    
    // Sign out from Supabase
    try {
      await supabase.auth.signOut();
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
