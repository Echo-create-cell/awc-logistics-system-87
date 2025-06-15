
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - in real app this would come from backend
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@awclogistics.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'John Sales Director',
    email: 'john@awclogistics.com',
    role: 'sales_director',
    status: 'active',
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    name: 'Mike Sales Agent',
    email: 'mike@awclogistics.com',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-01-01'
  },
  {
    id: '4',
    name: 'Lisa Finance',
    email: 'lisa@awclogistics.com',
    role: 'finance_officer',
    status: 'active',
    createdAt: '2024-01-01'
  }
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('awc_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - password is 'password' for all users
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('awc_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('awc_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
