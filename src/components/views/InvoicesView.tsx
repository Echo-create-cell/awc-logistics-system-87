import React, { useState } from 'react';
import InvoiceGenerator from '@/components/InvoiceGenerator';
import SearchableTable from '@/components/SearchableTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { InvoiceData } from '@/types/invoice';
import { User, Quotation } from '@/types';
import InvoiceModal from '../modals/InvoiceModal';

interface InvoicesViewProps {
  user: User;
  invoices: InvoiceData[];
  onSave: (invoice: InvoiceData) => void;
  onPrint: (invoice: InvoiceData) => void;
  onView: (invoice: InvoiceData) => void;
  setActiveTab: (tab: string) => void;
  quotations: Quotation[];
  invoiceQuotation: Quotation | null;
  onInvoiceQuotationClear: () => void;
}

const InvoicesView = ({
  user, invoices, onSave, onPrint, onView, setActiveTab, quotations, invoiceQuotation, onInvoiceQuotationClear
}: any) => {

  const [modalInvoice, setModalInvoice] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleView = (invoice: InvoiceData) => {
    setModalInvoice(invoice);
    setModalOpen(true);
    onView?.(invoice);
  };

  // If user is creating invoice from a quotation, show InvoiceGenerator pre-filled
  if ((user.role === 'sales_director' || user.role === 'sales_agent') && invoiceQuotation) {
    return (
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <button 
            className="rounded px-3 py-1 bg-gray-200 hover:bg-gray-300"
            onClick={onInvoiceQuotationClear}
          >← Back to Invoices</button>
          <span>Generating Invoice for Quotation <strong>{invoiceQuotation.id}</strong></span>
        </div>
        <InvoiceGenerator
          quotation={invoiceQuotation}
          onSave={onSave}
          onPrint={onPrint}
        />
      </div>
    );
  }

  // If user is not sales agent/director, show invoice table
  const invoiceColumns = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { key: 'clientName', label: 'Client' },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (value: number, row: any) => `${row.currency} ${value.toLocaleString()}`
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
        return <Badge className={`px-2 py-1 rounded ${colors[value]}`}>{value}</Badge>;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(row)}
          >View</Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPrint(row)}
          >Print</Button>
        </div>
      ),
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
        searchFields={['invoiceNumber', 'clientName', 'status']}
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
        onView={handleView}
        onPrint={onPrint}
      />
      <InvoiceModal
        open={modalOpen}
        invoice={modalInvoice}
        onClose={() => setModalOpen(false)}
        onPrint={onPrint}
      />
    </div>
  );
};

export default InvoicesView;
