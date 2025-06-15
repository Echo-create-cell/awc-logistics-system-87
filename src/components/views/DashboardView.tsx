
import React from 'react';
import DashboardStats from '@/components/DashboardStats';
import RecentQuotations from '@/components/dashboard/RecentQuotations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Quotation } from '@/types';

interface DashboardViewProps {
  user: User;
  users: User[];
  quotations: Quotation[];
  setActiveTab: (tab: string) => void;
}

const DashboardView = ({ user, users, quotations, setActiveTab }: DashboardViewProps) => {
  const recentPendingQuotations = quotations
    .filter(q => q.status === 'pending')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's a summary of your activities.
        </p>
      </div>

      <DashboardStats user={user} users={users} quotations={quotations} />

      <div className="grid grid-cols-1">
        {user.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Quotation Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentQuotations 
                quotations={recentPendingQuotations} 
                userRole={user.role}
                setActiveTab={setActiveTab}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
