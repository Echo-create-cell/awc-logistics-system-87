import React, { useState } from 'react';
import SearchableTable from '@/components/SearchableTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Quotation, User } from '@/types';
import QuotationModal from '../modals/QuotationModal';
import { getQuotationColumns } from '../quotations/quotationTableColumns';

interface QuotationsViewProps {
  user: User;
  quotations: Quotation[];
  setActiveTab: (tab: string) => void;
  onInvoiceFromQuotation?: (quotation: Quotation) => void;
  onEdit?: (quotation: Quotation) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const QuotationsView = ({
  user, quotations, setActiveTab, onInvoiceFromQuotation, onEdit, onApprove, onReject
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

  const quotationColumns = getQuotationColumns({
    user,
    onApprove,
    onReject,
    onInvoiceFromQuotation,
    onEdit: handleEdit,
  });

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
        user={user}
      />
    </div>
  );
};

export default QuotationsView;
