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

  const establishSupabaseSession = async (foundUser: User) => {
    try {
      console.log('Establishing Supabase session for user:', foundUser);
      
      // Try to sign in with email and password (creating a real session)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${foundUser.id}@temp.local`, // Use unique email per user
        password: 'tempPassword123!'
      });

      if (error && error.message.includes('Invalid login credentials')) {
        console.log('User not found in auth, creating new user...');
        
        // Sign up the user first
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: `${foundUser.id}@temp.local`,
          password: 'tempPassword123!',
          options: {
            data: {
              name: foundUser.name,
              role: foundUser.role
            }
          }
        });

        if (signUpError) {
          console.error('Failed to sign up user:', signUpError);
          throw signUpError;
        }

        console.log('User signed up successfully:', signUpData);
      } else if (error) {
        console.error('Failed to sign in user:', error);
        throw error;
      } else {
        console.log('User signed in successfully:', data);
      }

      // Get current session to confirm
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session:', sessionData);

      if (sessionData.session?.user) {
        // Create or update user profile in Supabase
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: sessionData.session.user.id,
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role as any,
            status: foundUser.status as any,
          }, {
            onConflict: 'user_id'
          });

        if (profileError) {
          console.error('Profile creation/update error:', profileError);
        } else {
          console.log('Profile updated successfully');
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to establish Supabase session:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth...');
      
      // Check for stored user session
      const storedUser = localStorage.getItem('awc_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log('Found stored user:', user);
        
        // Establish Supabase session for the stored user
        const sessionEstablished = await establishSupabaseSession(user);
        
        if (sessionEstablished) {
          setUser(user);
          console.log('Auth initialization complete - user restored with Supabase session');
        } else {
          console.warn('Failed to establish Supabase session, clearing stored user');
          localStorage.removeItem('awc_user');
        }
      } else {
        console.log('No stored user found');
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
        console.log('Login successful for user:', foundUser);
        
        // Establish Supabase session
        const sessionEstablished = await establishSupabaseSession(foundUser);
        
        if (sessionEstablished) {
          setUser(foundUser);
          localStorage.setItem('awc_user', JSON.stringify(foundUser));
          notifyLoginSuccess(foundUser);
          setIsLoading(false);
          return true;
        } else {
          throw new Error('Failed to establish database session');
        }
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
