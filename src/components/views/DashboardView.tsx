
import React from 'react';
import DashboardStats from '@/components/DashboardStats';
import RecentQuotations from '@/components/dashboard/RecentQuotations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Quotation } from '@/types';

interface DashboardViewProps {
  userRole: User['role'];
  quotations: Quotation[];
  setActiveTab: (tab: string) => void;
}

const DashboardView = ({ userRole, quotations, setActiveTab }: DashboardViewProps) => {
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

      <DashboardStats quotations={quotations} />

      <div className="grid grid-cols-1">
        {userRole === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Quotation Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentQuotations 
                quotations={recentPendingQuotations} 
                userRole={userRole}
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
