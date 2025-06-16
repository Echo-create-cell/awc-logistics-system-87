
import React from 'react';
import InvoiceGenerator from '@/components/InvoiceGenerator';
import SearchableTable from '@/components/SearchableTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { InvoiceData } from '@/types/invoice';
import { User } from '@/types';

interface InvoicesViewProps {
  user: User;
  invoices: InvoiceData[];
  onSave: (invoice: InvoiceData) => void;
  onPrint: (invoice: InvoiceData) => void;
  onView: (invoice: InvoiceData) => void;
  setActiveTab: (tab: string) => void;
}

const InvoicesView = ({ user, invoices, onSave, onPrint, onView, setActiveTab }: InvoicesViewProps) => {
  if (user.role === 'sales_director' || user.role === 'sales_agent') {
    return (
      <InvoiceGenerator 
        onSave={onSave}
        onPrint={onPrint}
      />
    );
  }

  const invoiceColumns = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { key: 'clientName', label: 'Client' },
    { 
      key: 'totalAmount', 
      label: 'Amount',
      render: (value: number, row: InvoiceData) => `${row.currency} ${value.toLocaleString()}`
    },
    { 
      key: 'issueDate', 
      label: 'Issue Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => {
        const colors: {[key: string]: string} = {
          paid: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          overdue: 'bg-red-100 text-red-800'
        };
        return <Badge className={colors[value]}>{value}</Badge>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <Button onClick={() => setActiveTab('invoices')}>
          <FileText size={16} className="mr-2" />
          New Invoice
        </Button>
      </div>
      <SearchableTable
        title="Generated Invoices"
        data={invoices}
        columns={invoiceColumns}
        searchFields={['invoiceNumber', 'clientName']}
        filterOptions={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'pending', label: 'Pending' },
              { value: 'paid', label: 'Paid' },
              { value: 'overdue', label: 'Overdue' }
            ]
          }
        ]}
        onView={onView}
        onPrint={onPrint}
      />
    </div>
  );
};

export default InvoicesView;
