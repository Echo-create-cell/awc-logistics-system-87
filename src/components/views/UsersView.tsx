import React, { useState } from 'react';
import SearchableTable from '@/components/SearchableTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { User } from '@/types';
import UserModal from '../modals/UserModal';

interface UsersViewProps {
  users: User[];
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (id: string) => void;
}

const UsersView = ({ users, onView, onEdit, onDelete }: UsersViewProps) => {
  const [modalUser, setModalUser] = useState<User|null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [modalOpen, setModalOpen] = useState(false);

  const handleView = (user: User) => {
    setModalUser(user);
    setModalMode("view");
    setModalOpen(true);
    onView?.(user);
  };

  const handleEdit = (user: User) => {
    setModalUser(user);
    setModalMode("edit");
    setModalOpen(true);
    onEdit?.(user);
  };
  const handleDelete = (id: string) => {
    onDelete?.(id);
    setModalOpen(false);
  };

  const userColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge className={value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: User) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => handleView(row)}>
            <Eye size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>
            <Edit size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-700">
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button>
          <Plus size={16} className="mr-2" />
          Add User
        </Button>
      </div>
      <SearchableTable
        title="Users"
        data={users}
        columns={userColumns}
        searchFields={['name', 'email', 'role']}
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
        onSave={onEdit ?? (()=>{})}
        onDelete={onDelete ?? (()=>{})}
        mode={modalMode}
      />
    </div>
  );
};

export default UsersView;
