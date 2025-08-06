import { useState } from 'react';
import { User } from '@/types';
import { useNotifications } from '@/hooks/useNotifications';

interface UserCredentials {
  email: string;
  password: string;
  temporaryPassword?: boolean;
  lastPasswordReset?: string;
}

interface UserManagementReturn {
  users: User[];
  userCredentials: Record<string, UserCredentials>;
  createUser: (userData: Omit<User, 'id' | 'createdAt'>, password: string) => Promise<User>;
  updateUser: (userId: string, userData: Partial<User>) => Promise<User>;
  deleteUser: (userId: string) => Promise<boolean>;
  resetUserPassword: (userId: string, newPassword?: string) => Promise<string>;
  getUserCredentials: (userId: string) => UserCredentials | null;
  validateAdminAccess: (currentUser: User | null) => boolean;
}

export const useUserManagement = (initialUsers: User[]): UserManagementReturn => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [userCredentials, setUserCredentials] = useState<Record<string, UserCredentials>>(() => {
    // Initialize with default credentials for existing users
    const credentials: Record<string, UserCredentials> = {};
    initialUsers.forEach(user => {
      credentials[user.id] = {
        email: user.email,
        password: 'password', // Default password for all users
        temporaryPassword: false,
        lastPasswordReset: undefined
      };
    });
    return credentials;
  });

  const {
    notifyUserCreated,
    notifyUserUpdated,
    notifyUserDeleted,
    notifyPasswordReset,
    notifyError
  } = useNotifications();

  const validateAdminAccess = (currentUser: User | null): boolean => {
    return currentUser?.role === 'admin';
  };

  const generateRandomPassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const createUser = async (userData: Omit<User, 'id' | 'createdAt'>, password: string): Promise<User> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if email already exists
    const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    // Store user credentials
    setUserCredentials(prev => ({
      ...prev,
      [newUser.id]: {
        email: userData.email,
        password: password,
        temporaryPassword: true,
        lastPasswordReset: new Date().toISOString()
      }
    }));

    setUsers(prev => [newUser, ...prev]);
    notifyUserCreated(newUser, { additionalInfo: { showCredentials: true, password } });
    
    return newUser;
  };

  const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Check if email is being changed and if it already exists
    if (userData.email) {
      const existingUser = users.find(u => 
        u.email.toLowerCase() === userData.email!.toLowerCase() && u.id !== userId
      );
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Update email in credentials if changed
      setUserCredentials(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          email: userData.email!
        }
      }));
    }

    const updatedUser = { ...users[userIndex], ...userData };
    setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    notifyUserUpdated(updatedUser);
    
    return updatedUser;
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) {
      throw new Error('User not found');
    }

    // Prevent deletion of the last admin
    const adminUsers = users.filter(u => u.role === 'admin');
    if (userToDelete.role === 'admin' && adminUsers.length === 1) {
      throw new Error('Cannot delete the last admin user');
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    setUserCredentials(prev => {
      const { [userId]: _, ...rest } = prev;
      return rest;
    });
    
    notifyUserDeleted(userToDelete.name);
    return true;
  };

  const resetUserPassword = async (userId: string, newPassword?: string): Promise<string> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const password = newPassword || generateRandomPassword();
    
    setUserCredentials(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        password: password,
        temporaryPassword: true,
        lastPasswordReset: new Date().toISOString()
      }
    }));

    notifyPasswordReset(user.name, password);
    return password;
  };

  const getUserCredentials = (userId: string): UserCredentials | null => {
    return userCredentials[userId] || null;
  };

  return {
    users,
    userCredentials,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    getUserCredentials,
    validateAdminAccess
  };
};