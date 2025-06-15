
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
  onInvoiceFromQuotation?: (quotation: Quotation) => void;
}

const QuotationsView = ({ user, quotations, onView, setActiveTab, onInvoiceFromQuotation }: QuotationsViewProps) => {
  const quotationColumns: {
    key: keyof Quotation | "actions",
    label: string,
    render?: (value: any, row: Quotation) => React.ReactNode
  }[] = [
    { key: 'clientName', label: 'Client', render: value => value || 'N/A' },
    { key: 'volume', label: 'Volume' },
    { key: 'destination', label: 'Destination', render: value => value || 'N/A' },
    { key: 'doorDelivery', label: 'Door Delivery', render: value => value || 'N/A' },
    {
      key: 'buyRate',
      label: 'Buy Rate',
      render: (value, row) => `${row.currency} ${value.toLocaleString()}`
    },
    {
      key: 'clientQuote',
      label: 'Client Quote',
      render: (value, row) => `${row.currency} ${value.toLocaleString()}`
    },
    {
      key: 'profit',
      label: 'Profit',
      render: (value, row) => `${row.currency} ${value.toLocaleString()}`
    },
    { key: 'quoteSentBy', label: 'Quote Sent By' },
    {
      key: 'status',
      label: 'Status',
      render: value => {
        const colors = {
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
      render: (value, row) => value && row.approvedAt ? `${value} on ${new Date(row.approvedAt).toLocaleDateString()}` : 'N/A'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value, row) =>
        (user.role === 'sales_director' || user.role === 'sales_agent') && row.status === 'won' ? (
          <Button
            className="ml-2 px-2 py-1 text-white bg-fuchsia-700 rounded hover:bg-fuchsia-900 text-xs"
            onClick={() => onInvoiceFromQuotation?.(row)}
          >
            Generate Invoice
          </Button>
        ) : null,
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
          <Button className="bg-fuchsia-700 px-4 py-2 rounded text-white hover:bg-fuchsia-900" onClick={() => setActiveTab('create')}>
            + Create Quotation
          </Button>
        )}
      </div>
      <div>
        <table className="w-full text-xs">
          <thead>
            <tr>
              {quotationColumns.map(col =>
                <th key={col.key as string} className="p-2 bg-slate-100 text-left">{col.label}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredQuotations.map(q =>
              <tr key={q.id} className="border-b hover:bg-slate-50">
                {quotationColumns.map(col =>
                  <td key={col.key as string} className="p-2">
                    {col.render
                      ? col.render((q as any)[col.key], q)
                      : (q as any)[col.key]}
                  </td>
                )}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuotationsView;
