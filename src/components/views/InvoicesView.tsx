
import React, { useState } from 'react';
import InvoiceGenerator from '@/components/InvoiceGenerator';
import SearchableTable from '@/components/SearchableTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, Trash2, Printer } from 'lucide-react';
import { InvoiceData } from '@/types/invoice';
import { User, Quotation } from '@/types';
import InvoiceModal from '../modals/InvoiceModal';

interface InvoicesViewProps {
  user: User;
  invoices: InvoiceData[];
  onSave: (invoice: InvoiceData) => void;
  onEdit: (invoice: InvoiceData) => void;
  onDelete: (id: string) => void;
  onPrint: (invoice: InvoiceData) => void;
  setActiveTab: (tab: string) => void;
  quotations: Quotation[];
  invoiceQuotation: Quotation | null;
  onInvoiceQuotationClear: () => void;
}

const InvoicesView = ({
  user, invoices, onSave, onEdit, onDelete, onPrint, setActiveTab, quotations, invoiceQuotation, onInvoiceQuotationClear
}: InvoicesViewProps) => {
  const [modalInvoice, setModalInvoice] = useState<InvoiceData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEdit = (invoice: InvoiceData) => {
    setModalInvoice(invoice);
    setModalOpen(true);
  };

  const handleSave = (updatedInvoice: InvoiceData) => {
    onEdit(updatedInvoice);
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setModalOpen(false);
  };

  // If user is creating invoice from a quotation, show InvoiceGenerator pre-filled
  if ((user.role === 'sales_director' || user.role === 'sales_agent') && invoiceQuotation) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Button 
            variant="outline"
            className="bg-white hover:bg-gray-50"
            onClick={onInvoiceQuotationClear}
          >
            ← Back to Invoices
          </Button>
          <div>
            <h3 className="font-medium text-blue-900">Generating Invoice</h3>
            <p className="text-blue-700 text-sm">
              Creating invoice from Quotation <strong>{invoiceQuotation.id}</strong> for <strong>{invoiceQuotation.clientName}</strong>
            </p>
          </div>
        </div>
        <InvoiceGenerator
          quotation={invoiceQuotation}
          onSave={onSave}
          onPrint={onPrint}
        />
      </div>
    );
  }

  const invoiceColumns = [
    { 
      key: 'invoiceNumber', 
      label: 'Invoice #',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    { 
      key: 'clientName', 
      label: 'Client',
      render: (value: string) => (
        <div className="font-medium text-gray-700">{value}</div>
      )
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (value: number, row: InvoiceData) => (
        <div className="font-medium text-blue-600">
          {row.currency} {value.toLocaleString()}
        </div>
      )
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      render: (value: string) => (
        <div className="text-gray-600">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (value: string) => (
        <div className="text-gray-600">
          {value ? new Date(value).toLocaleDateString() : 'N/A'}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const colors: {[key: string]: string} = {
          paid: 'bg-green-100 text-green-800 hover:bg-green-200',
          pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
          overdue: 'bg-red-100 text-red-800 hover:bg-red-200'
        };
        return <Badge className={`${colors[value]} font-medium`}>{value}</Badge>;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: InvoiceData) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPrint(row)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Printer size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(row)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Edit size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
          <p className="text-gray-600 mt-1">Manage and track all generated invoices</p>
        </div>
        <Button onClick={() => setActiveTab('invoices')} className="bg-primary hover:bg-primary/90">
          <FileText size={16} className="mr-2" />
          New Invoice
        </Button>
      </div>
      
      <SearchableTable
        title={`${invoices.length} Generated Invoices`}
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
      />
      
      <InvoiceModal
        open={modalOpen}
        invoice={modalInvoice}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        onPrint={onPrint}
      />
    </div>
  );
};

export default InvoicesView;
