
import React from 'react';
import { Users, FileText, DollarSign, BarChart3, Home, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

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
          { id: 'logout', label: 'Logout', icon: LogOut },
        ];
      case 'sales_director':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'quotations', label: 'My Quotations', icon: FileText },
          { id: 'create', label: 'Create Quotation', icon: FileText },
          { id: 'invoices', label: 'Invoices', icon: DollarSign },
          { id: 'reports', label: 'Quotation Reports', icon: BarChart3 },
          { id: 'logout', label: 'Logout', icon: LogOut },
        ];
      case 'sales_agent':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'quotations', label: 'Approved Quotations', icon: FileText },
          { id: 'invoices', label: 'Invoices', icon: DollarSign },
          { id: 'logout', label: 'Logout', icon: LogOut },
        ];
      case 'finance_officer':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
          { id: 'invoices', label: 'Invoice Management', icon: DollarSign },
          { id: 'logout', label: 'Logout', icon: LogOut },
        ];
      case 'partner':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'quotations', label: 'View Quotations', icon: FileText },
          { id: 'invoices', label: 'View Invoices', icon: DollarSign },
          { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
          { id: 'logout', label: 'Logout', icon: LogOut },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="bg-sidebar text-sidebar-foreground w-64 min-h-screen p-6 flex flex-col shadow-large">
      <div className="mb-8 smooth-entrance">
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src="/lovable-uploads/42894000-b0f9-4208-a908-0ff700e4e3b3.png" 
            alt="AWC Logo" 
            className="h-10 w-auto brightness-0 invert"
          />
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">AWC Logistics</h1>
            <p className="text-xs text-sidebar-foreground/70 uppercase tracking-wider">Professional Suite</p>
          </div>
        </div>
        <div className="bg-sidebar-accent/30 rounded-lg p-3 border border-sidebar-border/20">
          <p className="text-sm font-medium text-sidebar-foreground capitalize">{userRole.replace('_', ' ')}</p>
          <p className="text-xs text-sidebar-foreground/80">{user?.name}</p>
        </div>
      </div>
      
      <nav className="space-y-3 flex-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => item.id === 'logout' ? handleLogout() : onTabChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
                activeTab === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/90 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
