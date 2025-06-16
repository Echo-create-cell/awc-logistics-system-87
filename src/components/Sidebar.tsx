
import React from 'react';
import { Users, FileText, DollarSign, BarChart3, Home, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  userRole: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ userRole, activeTab, onTabChange }: SidebarProps) => {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getMenuItems = () => {
    switch (userRole) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'quotations', label: 'Quotation Approvals', icon: FileText },
          { id: 'invoices', label: 'All Invoices', icon: DollarSign },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case 'sales_director':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'quotations', label: 'My Quotations', icon: FileText },
          { id: 'create', label: 'Create Quotation', icon: FileText },
          { id: 'invoices', label: 'Generate Invoices', icon: DollarSign },
        ];
      case 'sales_agent':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'quotations', label: 'Approved Quotations', icon: FileText },
          { id: 'invoices', label: 'Generate Invoices', icon: DollarSign },
        ];
      case 'finance_officer':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
          { id: 'invoices', label: 'Invoice Management', icon: DollarSign },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="bg-slate-900 text-white w-64 min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-blue-400">AWC Logistics</h1>
        <p className="text-sm text-slate-400 capitalize">{userRole.replace('_', ' ')}</p>
        <p className="text-xs text-slate-500">{user?.name}</p>
      </div>
      
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                activeTab === item.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="mt-auto">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
