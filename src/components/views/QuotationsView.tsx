
import React from 'react';
import SearchableTable from '@/components/SearchableTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { Quotation, User } from '@/types';

interface QuotationsViewProps {
  user: User;
  quotations: Quotation[];
  onView: (quotation: Quotation) => void;
  setActiveTab: (tab: string) => void;
}

const QuotationsView = ({ user, quotations, onView, setActiveTab }: QuotationsViewProps) => {
  const quotationColumns = [
    { key: 'clientName', label: 'Client', render: (value: string) => value || 'N/A' },
    { key: 'volume', label: 'Volume' },
    {
      key: 'buyRate',
      label: 'Buy Rate',
      render: (value: number, row: Quotation) => `${row.currency} ${value.toLocaleString()}`
    },
    {
      key: 'clientQuote',
      label: 'Client Quote',
      render: (value: number, row: Quotation) => `${row.currency} ${value.toLocaleString()}`
    },
    {
      key: 'profit',
      label: 'Profit',
      render: (value: number, row: Quotation) => `${row.currency} ${value.toLocaleString()}`
    },
    { key: 'quoteSentBy', label: 'Quote Sent By' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const colors: { [key: string]: string } = {
          won: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          lost: 'bg-red-100 text-red-800'
        };
        return <Badge className={colors[value]}>{value}</Badge>;
      }
    },
    {
      key: 'approvedBy',
      label: 'Approved By',
      render: (value: string | undefined, row: Quotation) => value && row.approvedAt ? `${value} on ${new Date(row.approvedAt).toLocaleDateString()}` : 'N/A'
    },
  ];

  const filteredQuotations = user.role === 'admin'
    ? quotations.filter(q => q.status === 'pending')
    : quotations;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {user.role === 'admin' ? 'Quotation Approvals' : 'My Quotations'}
        </h2>
        {(user.role === 'sales_director' || user.role === 'sales_agent') && (
          <Button onClick={() => setActiveTab('create')}>
            <Plus size={16} className="mr-2" />
            Create Quotation
          </Button>
        )}
      </div>
      <SearchableTable
        title="Quotations"
        data={filteredQuotations}
        columns={quotationColumns}
        searchFields={['volume', 'quoteSentBy', 'currency', 'clientName']}
        filterOptions={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'pending', label: 'Pending' },
              { value: 'won', label: 'Won' },
              { value: 'lost', label: 'Lost' }
            ]
          },
          {
            key: 'currency',
            label: 'Currency',
            options: [
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
              { value: 'RWF', label: 'RWF' }
            ]
          }
        ]}
        onView={onView}
        onPrint={(quotation) => window.print()}
      />
    </div>
  );
};

export default QuotationsView;
