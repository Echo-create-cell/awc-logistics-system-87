import React, { useState } from 'react';
import SearchableTable from '@/components/SearchableTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Quotation, User } from '@/types';
import QuotationModal from '../modals/QuotationModal';

interface QuotationsViewProps {
  user: User;
  quotations: Quotation[];
  onView: (quotation: Quotation) => void;
  setActiveTab: (tab: string) => void;
  onInvoiceFromQuotation?: (quotation: Quotation) => void;
  onEdit?: (quotation: Quotation) => void;
  onDelete?: (id: string) => void;
}

const QuotationsView = ({
  user, quotations, onView, setActiveTab, onInvoiceFromQuotation, onEdit, onDelete
}: QuotationsViewProps) => {
  const [modalQuotation, setModalQuotation] = useState<Quotation|null>(null);
  const [modalMode, setModalMode] = useState<"view"|"edit">("view");
  const [modalOpen, setModalOpen] = useState(false);

  const handleView = (quotation: Quotation) => {
    setModalQuotation(quotation);
    setModalMode("view");
    setModalOpen(true);
    onView?.(quotation);
  };
  const handleEdit = (quotation: Quotation) => {
    setModalQuotation(quotation);
    setModalMode("edit");
    setModalOpen(true);
    onEdit?.(quotation);
  };
  const handleDelete = (id: string) => {
    onDelete?.(id);
    setModalOpen(false);
  };

  const quotationColumns = [
    { key: 'clientName', label: 'Client', render: (value: string) => value || 'N/A' },
    { key: 'volume', label: 'Volume' },
    { key: 'destination', label: 'Destination', render: (value: string) => value || 'N/A' },
    { key: 'doorDelivery', label: 'Door Delivery', render: (value: string) => value || 'N/A' },
    {
      key: 'buyRate', label: 'Buy Rate',
      render: (value: number, row: Quotation) => `${row.currency} ${value.toLocaleString()}`
    },
    {
      key: 'clientQuote', label: 'Client Quote',
      render: (value: number, row: Quotation) => `${row.currency} ${value.toLocaleString()}`
    },
    {
      key: 'profit', label: 'Profit',
      render: (value: number, row: Quotation) => `${row.currency} ${value.toLocaleString()}`
    },
    { key: 'quoteSentBy', label: 'Quote Sent By' },
    {
      key: 'status', label: 'Status',
      render: (value: string) => {
        const colors = {
          won: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          lost: 'bg-red-100 text-red-800'
        };
        return <Badge className={colors[value]}>{value}</Badge>;
      }
    },
    {
      key: 'approvedBy', label: 'Approved By',
      render: (value: string, row: Quotation) => value && row.approvedAt
        ? `${value} on ${new Date(row.approvedAt).toLocaleDateString()}`
        : 'N/A'
    },
    {
      key: 'actions', label: 'Actions',
      render: (_: any, row: Quotation) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => handleView(row)}>
            <Eye size={16} />
          </Button>
          {(user.role === 'sales_director' || user.role === 'sales_agent') && row.status === 'won' && (
            <Button
              size="sm"
              className="px-2 py-1 text-white bg-fuchsia-700 rounded hover:bg-fuchsia-900 text-xs"
              onClick={() => onInvoiceFromQuotation?.(row)}
            >
              Generate Invoice
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>
            <Edit size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-700">
            <Trash2 size={16} />
          </Button>
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
        <h2 className="text-2xl font-bold">
          {user.role === 'admin' ? 'Quotation Approvals' : 'My Quotations'}
        </h2>
        {(user.role === 'sales_director' || user.role === 'sales_agent') && (
          <Button className="bg-fuchsia-700 px-4 py-2 rounded text-white hover:bg-fuchsia-900" onClick={() => setActiveTab('create')}>
            + Create Quotation
          </Button>
        )}
      </div>
      <SearchableTable
        title="Quotations"
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
        onSave={onEdit ?? (()=>{})}
        onDelete={onDelete ?? (()=>{})}
        mode={modalMode}
      />
    </div>
  );
};

export default QuotationsView;
