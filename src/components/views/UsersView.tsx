
import React, { useState } from 'react';
import SearchableTable from '@/components/SearchableTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { User } from '@/types';
import UserModal from '../modals/UserModal';

interface UsersViewProps {
  users: User[];
  onEdit?: (user: User) => void;
  onDelete?: (id: string) => void;
}

const UsersView = ({ users, onEdit, onDelete }: UsersViewProps) => {
  const [modalUser, setModalUser] = useState<User|null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEdit = (user: User) => {
    setModalUser(user);
    setModalOpen(true);
  };

  const handleSave = (updatedUser: User) => {
    onEdit?.(updatedUser);
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    onDelete?.(id);
    setModalOpen(false);
  };

  const userColumns = [
    { 
      key: 'name', 
      label: 'Name',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    { 
      key: 'email', 
      label: 'Email',
      render: (value: string) => (
        <div className="text-gray-600">{value}</div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <Badge variant="outline" className="capitalize font-medium">
          {value.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
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
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => (
        <div className="text-gray-500 text-sm">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: User) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Edit size={16} />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => handleDelete(row.id)} 
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus size={16} className="mr-2" />
          Add User
        </Button>
      </div>
      
      <SearchableTable
        title="System Users"
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
