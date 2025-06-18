
import React from 'react';
import DashboardStats from '@/components/DashboardStats';
import RecentQuotations from '@/components/dashboard/RecentQuotations';
import UserActivityMonitor from '@/components/admin/UserActivityMonitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';

interface DashboardViewProps {
  user: User;
  users: User[];
  quotations: Quotation[];
  invoices: InvoiceData[];
  onTabChange: (tab: string) => void;
}

const DashboardView = ({ user, users, quotations, invoices, onTabChange }: DashboardViewProps) => {
  const recentPendingQuotations = quotations
    .filter(q => {
      if (user.role === 'admin') {
        return q.status === 'pending';
      }
      if (user.role === 'sales_director' || user.role === 'sales_agent') {
        return q.status === 'pending' && q.quoteSentBy === user.name;
      }
      return false;
    })
    .slice(0, 5);

  const cardTitle = user.role === 'admin' ? 'Pending Quotation Approvals' : 'Your Recent Pending Quotations';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's a summary of your activities.
        </p>
      </div>

      <DashboardStats user={user} users={users} quotations={quotations} />

      {/* Admin User Activity Monitor */}
      {user.role === 'admin' && (
        <UserActivityMonitor 
          users={users} 
          quotations={quotations} 
          invoices={invoices} 
        />
      )}

      {(user.role === 'admin' || user.role === 'sales_director' || user.role === 'sales_agent') && recentPendingQuotations.length > 0 && (
        <div className="grid grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>{cardTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentQuotations 
                quotations={recentPendingQuotations} 
                userRole={user.role}
                setActiveTab={onTabChange}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
