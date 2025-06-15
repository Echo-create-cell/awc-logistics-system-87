import React, { useState } from 'react';
import SearchableTable from '@/components/SearchableTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Quotation, User } from '@/types';
import QuotationModal from '../modals/QuotationModal';

interface QuotationsViewProps {
  user: User;
  quotations: Quotation[];
  setActiveTab: (tab: string) => void;
  onInvoiceFromQuotation?: (quotation: Quotation) => void;
  onEdit?: (quotation: Quotation) => void;
  onDelete?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const QuotationsView = ({
  user, quotations, setActiveTab, onInvoiceFromQuotation, onEdit, onDelete, onApprove, onReject
}: QuotationsViewProps) => {
  const [modalQuotation, setModalQuotation] = useState<Quotation|null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEdit = (quotation: Quotation) => {
    setModalQuotation(quotation);
    setModalOpen(true);
  };

  const handleSave = (updatedQuotation: Quotation) => {
    onEdit?.(updatedQuotation);
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    onDelete?.(id);
    setModalOpen(false);
  };

  const quotationColumns = [
    { 
      key: 'clientName', 
      label: 'Client',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value || 'N/A'}</div>
      )
    },
    { 
      key: 'volume', 
      label: 'Volume',
      render: (value: string) => (
        <div className="text-gray-700">{value}</div>
      )
    },
    { 
      key: 'destination', 
      label: 'Destination',
      render: (value: string) => (
        <div className="text-gray-700">{value || 'N/A'}</div>
      )
    },
    {
      key: 'buyRate', 
      label: 'Buy Rate',
      render: (value: number, row: Quotation) => (
        <div className="font-medium">{row.currency} {value.toLocaleString()}</div>
      )
    },
    {
      key: 'clientQuote', 
      label: 'Client Quote',
      render: (value: number, row: Quotation) => (
        <div className="font-medium text-blue-600">{row.currency} {value.toLocaleString()}</div>
      )
    },
    {
      key: 'profit', 
      label: 'Profit',
      render: (value: number, row: Quotation) => (
        <div className="font-medium text-green-600">{row.currency} {value.toLocaleString()}</div>
      )
    },
    { 
      key: 'quoteSentBy', 
      label: 'Quote Sent By',
      render: (value: string) => (
        <div className="text-gray-600">{value}</div>
      )
    },
    {
      key: 'status', 
      label: 'Status',
      render: (value: string) => {
        const colors = {
          won: 'bg-green-100 text-green-800 hover:bg-green-200',
          pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
          lost: 'bg-red-100 text-red-800 hover:bg-red-200'
        };
        const statusText = {
          won: 'Approved',
          pending: 'Pending',
          lost: 'Rejected'
        };
        return <Badge className={`${colors[value]} font-medium`}>{statusText[value] || value}</Badge>;
      }
    },
    {
      key: 'approvedBy', 
      label: 'Approved By',
      render: (value: string, row: Quotation) => (
        <div className="text-sm">
          {value && row.approvedAt
            ? (
              <div>
                <div className="font-medium text-gray-900">{value}</div>
                <div className="text-gray-500">{new Date(row.approvedAt).toLocaleDateString()}</div>
              </div>
            )
            : <span className="text-gray-400">N/A</span>
          }
        </div>
      )
    },
    {
      key: 'actions', 
      label: 'Actions',
      render: (_: any, row: Quotation) => (
        <div className="flex gap-2 items-center">
          {user.role === 'admin' && row.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onApprove?.(row.id)}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1"
                title="Approve"
              >
                <CheckCircle size={16} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onReject?.(row.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                title="Reject"
              >
                <XCircle size={16} />
              </Button>
            </>
          )}
          {(user.role === 'sales_director' || user.role === 'sales_agent') && row.status === 'won' && (
            <Button
              size="sm"
              className="px-2 py-1 text-white bg-fuchsia-700 rounded hover:bg-fuchsia-900 text-xs"
              onClick={() => onInvoiceFromQuotation?.(row)}
            >
              Generate Invoice
            </Button>
          )}
          { user.role !== 'sales_agent' &&
            <>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleEdit(row)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
            </>
          }
        </div>
      ),
    }
  ];

  // Admins see only pending, others see all
  const filteredQuotations = user.role === 'admin'
    ? quotations.filter(q => q.status === 'pending')
    : quotations;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {user.role === 'admin' ? 'Quotation Approvals' : 'My Quotations'}
          </h2>
          <p className="text-gray-600 mt-1">
            {user.role === 'admin' 
              ? 'Review and approve pending quotations' 
              : 'Manage your quotations and generate invoices'
            }
          </p>
        </div>
        {(user.role === 'sales_director' || user.role === 'sales_agent') && (
          <Button className="bg-fuchsia-700 px-4 py-2 rounded text-white hover:bg-fuchsia-900" onClick={() => setActiveTab('create')}>
            <Plus size={16} className="mr-2" />
            Create Quotation
          </Button>
        )}
      </div>
      
      <SearchableTable
        title={`${filteredQuotations.length} Quotations`}
        data={filteredQuotations}
        columns={quotationColumns}
        searchFields={['clientName', 'destination', 'quoteSentBy', 'status', 'approvedBy']}
        filterOptions={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'pending', label: 'Pending' },
              { value: 'won', label: 'Won' },
              { value: 'lost', label: 'Lost' }
            ]
          }
        ]}
      />
      
      <QuotationModal
        open={modalOpen}
        quotation={modalQuotation}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default QuotationsView;
