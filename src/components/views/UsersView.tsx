
import React, { useState } from 'react';
import { showPersistentToast } from '@/components/ui/persistent-toast';
import EnhancedSearchableTable from '@/components/enhanced/EnhancedSearchableTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Key, Shield } from 'lucide-react';
import { User } from '@/types';
import AdminUserModal from '../modals/AdminUserModal';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useAuth } from '@/contexts/AuthContext';

interface UsersViewProps {
  users?: User[]; // Make optional since we'll use users from the hook
}

const UsersView = ({ users: propUsers }: UsersViewProps) => {
  const { user: currentUser } = useAuth();
  const [modalUser, setModalUser] = useState<User|null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const {
    users, // Use users from the hook instead of props
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    getUserCredentials,
    validateAdminAccess
  } = useUserManagement(propUsers || []);

  const isAdmin = validateAdminAccess(currentUser);

  const handleEdit = (user: User) => {
    if (!isAdmin) return;
    setModalUser(user);
    setModalOpen(true);
  };
  
  const handleAddNewUser = () => {
    if (!isAdmin) return;
    setModalUser(null);
    setModalOpen(true);
  };

  const handleSave = async (userData: Omit<User, 'id' | 'createdAt'>, password: string) => {
    await createUser(userData, password);
    setModalOpen(false);
  };

  const handleUpdate = async (userId: string, userData: Partial<User>) => {
    await updateUser(userId, userData);
    setModalOpen(false);
  };

  const handleDelete = async (userId: string) => {
    await deleteUser(userId);
    setModalOpen(false);
  };

  const handleResetPassword = async (userId: string, newPassword?: string): Promise<string> => {
    return await resetUserPassword(userId, newPassword);
  };

  const handleExport = () => {
    try {
      // Generate CSV content with proper escaping
      let csvContent = 'Name,Email,Role,Status,Created Date\n';
      
      users.forEach(user => {
        // Properly escape CSV values to handle commas and quotes
        const escapeCSV = (value: string | null | undefined) => {
          if (!value) return '';
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        };
        
        const name = escapeCSV(user.name);
        const email = escapeCSV(user.email);
        const role = escapeCSV(user.role.replace('_', ' ').toUpperCase());
        const status = escapeCSV(user.status.toUpperCase());
        const createdDate = new Date(user.createdAt).toLocaleDateString();
        
        csvContent += `${name},${email},${role},${status},${createdDate}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `users-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show success notification
        console.log(`Successfully exported ${users.length} users to CSV`);
      }
    } catch (error) {
      console.error('Error exporting users to CSV:', error);
      showPersistentToast({
        title: 'User Export Failed',
        description: 'Failed to export users. Please try again.',
        variant: 'error',
        category: 'Export',
        persistent: false
      });
    }
  };

  const userColumns = [
    // Actions column moved to first position for easy access
    {
      key: 'actions',
      label: 'Actions',
      minWidth: '120px',
      render: (_: any, row: User) => (
        <div className="flex gap-2">
          {isAdmin ? (
            <>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleEdit(row)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                title="Edit User"
              >
                <Edit size={16} />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleResetPassword(row.id)}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                title="Reset Password"
              >
                <Key size={16} />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleDelete(row.id)} 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete User"
              >
                <Trash2 size={16} />
              </Button>
            </>
          ) : (
            <Badge variant="outline" className="text-xs">
              <Shield size={12} className="mr-1" />
              Admin Only
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      minWidth: '85px',
      render: (value: string) => (
        <Badge className={`${
          value === 'active' 
            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
            : 'bg-red-100 text-red-800 hover:bg-red-200'
        } font-medium`}>
          {value}
        </Badge>
      )
    },
    { 
      key: 'name', 
      label: 'Name',
      minWidth: '140px',
      render: (value: string) => (
        <div className="font-medium text-gray-900 text-sm">{value}</div>
      )
    },
    { 
      key: 'email', 
      label: 'Email',
      minWidth: '180px',
      render: (value: string) => (
        <div className="text-gray-600 text-sm truncate" title={value}>{value}</div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      minWidth: '120px',
      render: (value: string) => (
        <Badge variant="outline" className="capitalize font-medium">
          {value.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      minWidth: '90px',
      render: (value: string) => (
        <div className="text-gray-500 text-sm">
          {new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground mt-1">Manage system users and their permissions</p>
        </div>
        {isAdmin ? (
          <Button onClick={handleAddNewUser}>
            <Plus size={16} className="mr-2" />
            Add User
          </Button>
        ) : (
          <Badge variant="outline" className="px-4 py-2">
            <Shield size={16} className="mr-2" />
            Admin Access Required
          </Badge>
        )}
      </div>
      
      <EnhancedSearchableTable
        title={`${users.length} System User${users.length === 1 ? '' : 's'}`}
        data={users}
        columns={userColumns}
        searchFields={['name', 'email', 'role', 'status']}
        filterOptions={[
          {
            key: 'role',
            label: 'Role',
            options: [
              { value: 'admin', label: 'Admin' },
              { value: 'sales_director', label: 'Sales Director' },
              { value: 'sales_agent', label: 'Sales Agent' },
              { value: 'finance_officer', label: 'Finance Officer' }
            ]
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]
          }
        ]}
        onExport={handleExport}
        showExport={true}
        showRefresh={true}
      />
      
      <AdminUserModal
        open={modalOpen}
        user={modalUser}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onResetPassword={handleResetPassword}
        getUserCredentials={getUserCredentials}
      />
    </div>
  );
};

export default UsersView;
