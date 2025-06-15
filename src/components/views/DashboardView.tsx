
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardStats from '@/components/DashboardStats';
import { Quotation } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import RecentQuotations from '@/components/dashboard/RecentQuotations';

interface DashboardViewProps {
  userRole: string;
  quotations: Quotation[];
  setActiveTab: (tab: string) => void;
}

const DashboardView = ({ userRole, quotations, setActiveTab }: DashboardViewProps) => {
  // onApprove and onReject are not used by RecentQuotations, so they are removed from props
  return (
    <div className="space-y-8">
      <DashboardStats userRole={userRole} />
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Quotations</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                A quick look at the latest quotation activities.
              </p>
            </div>
            <Button variant="ghost" onClick={() => setActiveTab('quotations')}>
              View All Quotations <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <RecentQuotations quotations={quotations.slice(0, 5)} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardView;

