
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardStats from '@/components/DashboardStats';
import QuotationTable from '@/components/QuotationTable';
import { Quotation } from '@/types';

interface DashboardViewProps {
  userRole: string;
  quotations: Quotation[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const DashboardView = ({ userRole, quotations, onApprove, onReject }: DashboardViewProps) => {
  return (
    <div className="space-y-6">
      <DashboardStats userRole={userRole} />
      <Card>
        <CardHeader>
          <CardTitle>Recent Quotations</CardTitle>
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
