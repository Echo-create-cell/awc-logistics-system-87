
import React, { useState } from 'react';
import EnhancedSearchableTable from '@/components/enhanced/EnhancedSearchableTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { User } from '@/types';
import UserModal from '../modals/UserModal';

interface UsersViewProps {
  users: User[];
  onEdit?: (user: User) => void;
  onDelete?: (id: string) => void;
  onCreate?: (user: Omit<User, 'id' | 'createdAt'>) => void;
}

const UsersView = ({ users, onEdit, onDelete, onCreate }: UsersViewProps) => {
  const [modalUser, setModalUser] = useState<User|null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEdit = (user: User) => {
    setModalUser(user);
    setModalOpen(true);
  };
  
  const handleAddNewUser = () => {
    setModalUser(null);
    setModalOpen(true);
  };

  const handleSave = (userToSave: User | Partial<User>) => {
    if ('id' in userToSave && userToSave.id) {
      onEdit?.(userToSave as User);
    } else {
      onCreate?.(userToSave as Omit<User, 'id' | 'createdAt'>);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    onDelete?.(id);
    setModalOpen(false);
  };

  const handleExport = () => {
    const exportData = users.map(user => ({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `users-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const userColumns = [
    // Actions column moved to first position for easy access
    {
      key: 'actions',
      label: 'Actions',
      minWidth: '120px',
      render: (_: any, row: User) => (
        <div className="flex gap-2">
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
            onClick={() => handleDelete(row.id)} 
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete User"
          >
            <Trash2 size={16} />
          </Button>
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
        <Button onClick={handleAddNewUser}>
          <Plus size={16} className="mr-2" />
          Add User
        </Button>
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
      
      <UserModal
        open={modalOpen}
        user={modalUser}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default UsersView;
