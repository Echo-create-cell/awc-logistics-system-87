
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
    <div className="bg-sidebar text-sidebar-foreground w-64 min-h-screen p-6 flex flex-col shadow-2xl border-r border-border/20">
      <div className="mb-8 smooth-entrance">
        <div className="flex items-center space-x-3 mb-3">
          <img 
            src="/lovable-uploads/42894000-b0f9-4208-a908-0ff700e4e3b3.png" 
            alt="AWC Logo" 
            className="h-12 w-auto opacity-95 animate-float"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
          />
          <div>
            <h1 className="heading-xs gradient-text">AWC Logistics</h1>
            <p className="text-caption">Professional Suite</p>
          </div>
        </div>
        <div className="bg-sidebar-accent/20 rounded-lg p-3 border border-sidebar-border/30">
          <p className="text-label capitalize">{userRole.replace('_', ' ')}</p>
          <p className="text-body-sm">{user?.name}</p>
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
                "w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group",
                "hover:shadow-lg hover:scale-[1.02] transform text-label",
                activeTab === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md scale-[1.02]"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon size={20} className="transition-transform duration-300 group-hover:scale-110" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
