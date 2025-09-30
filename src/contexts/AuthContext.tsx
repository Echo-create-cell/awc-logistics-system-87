import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { useNotifications } from '@/hooks/useNotifications';
import { API_ENDPOINTS, apiFetch } from '@/config/api';

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
    name: 'Action@AWC',
    email: 'n.solange@africaworldcargo.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Director@AWC',
    email: 'i.arnold@africaworldcargo.com',
    role: 'sales_director',
    status: 'active',
    createdAt: '2024-02-01'
  },
  {
    id: '3',
    name: 'Agent@AWC',
    email: 'a.benon@africaworldcargo.com',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-02-15'
  },
  {
    id: '4',
    name: 'Agent2@AWC',
    email: 'n.mariemerci@africaworldcargo.com',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-03-01'
  },
  {
    id: '5',
    name: 'Finance@AWC',
    email: 'u.epiphanie@africaworldcargo.com',
    role: 'finance_officer',
    status: 'active',
    createdAt: '2024-03-05'
  },
  {
    id: '6',
    name: 'Partner@AWC',
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
  const [userCredentials, setUserCredentials] = useState<Record<string, string>>({});
  const { notifyLoginSuccess, notifyLoginFailed, notifyLogout } = useNotifications();

  const establishPHPSession = async (email: string, password: string) => {
    try {
      console.log('Establishing PHP session for email:', email);
      
      const response = await apiFetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.user) {
        console.log('User signed in successfully:', response);
        return response.user;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to establish PHP session:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth...');
      
      try {
        // Check for existing PHP session
        const response = await apiFetch(API_ENDPOINTS.auth.session);
        
        if (response.authenticated && response.user) {
          const user: User = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            role: response.user.role,
            status: 'active',
            createdAt: new Date().toISOString()
          };
          setUser(user);
          localStorage.setItem('awc_user', JSON.stringify(user));
          console.log('Auth initialization complete - user restored from PHP session');
        } else {
          console.log('No active PHP session found');
          localStorage.removeItem('awc_user');
        }
      } catch (error) {
        console.error('Session check error:', error);
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
      
      const userData = await establishPHPSession(email, password);
      
      if (userData) {
        const user: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          status: userData.status,
          createdAt: new Date().toISOString()
        };
        
        setUser(user);
        localStorage.setItem('awc_user', JSON.stringify(user));
        notifyLoginSuccess(user);
        setIsLoading(false);
        return true;
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
    
    // Sign out from PHP
    try {
      await apiFetch(API_ENDPOINTS.auth.logout, {
        method: 'POST',
      });
      console.log('PHP sign out successful');
    } catch (error) {
      console.error('PHP signout error:', error);
    }
    
    setUser(null);
    localStorage.removeItem('awc_user');
    if (currentUser) {
      notifyLogout(currentUser.name);
    }
  };

  const addUser = (newUser: User) => {
    setUsers(prev => [newUser, ...prev]);
    // User credentials are managed by Supabase Auth
    // No default hardcoded passwords
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
    // Credentials are managed by PHP backend
    // This method is kept for interface compatibility
    console.warn('User credentials are managed by PHP backend, not locally');
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
