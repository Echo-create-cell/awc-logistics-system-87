
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardStats from '@/components/DashboardStats';
import QuotationTable from '@/components/QuotationTable';
import { Quotation } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface DashboardViewProps {
  userRole: string;
  quotations: Quotation[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  setActiveTab: (tab: string) => void;
}

const DashboardView = ({ userRole, quotations, onApprove, onReject, setActiveTab }: DashboardViewProps) => {
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
            <Button variant="ghost" onClick={() => setActiveTab('invoices')}>
              View All Invoices <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <QuotationTable
            quotations={quotations.slice(0, 5)}
            userRole={userRole}
            onApprove={onApprove}
            onReject={onReject}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardView;
