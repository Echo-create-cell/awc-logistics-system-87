
import React, { useState } from 'react';
import EnhancedSearchableTable from '@/components/enhanced/EnhancedSearchableTable';
import PartnerDataFilter from '@/components/partner/PartnerDataFilter';
import { Button } from '@/components/ui/button';
import { Plus, Grid, List } from 'lucide-react';
import { Quotation, User } from '@/types';
import QuotationModal from '../modals/QuotationModal';
import { getQuotationColumns } from '../quotations/quotationTableColumns';
import RejectQuotationModal from '../modals/RejectQuotationModal';
import QuotationApprovalCard from '../admin/QuotationApprovalCard';

interface QuotationsViewProps {
  user: User;
  quotations: Quotation[];
  setActiveTab: (tab: string) => void;
  onInvoiceFromQuotation?: (quotation: Quotation) => void;
  onEdit?: (quotation: Quotation) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
}

const QuotationsView = ({
  user, quotations, setActiveTab, onInvoiceFromQuotation, onEdit, onApprove, onReject
}: QuotationsViewProps) => {
  const [modalQuotation, setModalQuotation] = useState<Quotation|null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [quotationToReject, setQuotationToReject] = useState<Quotation | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const handleEdit = (quotation: Quotation) => {
    setModalQuotation(quotation);
    setModalOpen(true);
  };

  const handleSave = (updatedQuotation: Quotation) => {
    onEdit?.(updatedQuotation);
    setModalOpen(false);
  };

  const handleRequestReject = (quotation: Quotation) => {
    setQuotationToReject(quotation);
    setRejectionModalOpen(true);
  };

  const handleConfirmReject = (reason: string) => {
    if (quotationToReject) {
      onReject?.(quotationToReject.id, reason);
    }
    setRejectionModalOpen(false);
    setQuotationToReject(null);
  };

  const handleViewQuotation = (quotation: Quotation) => {
    setModalQuotation(quotation);
    setModalOpen(true);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredQuotations, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `quotations-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const quotationColumns = getQuotationColumns({
    user,
    onApprove,
    onReject: (quotation: Quotation) => handleRequestReject(quotation),
    onInvoiceFromQuotation,
    onEdit: handleEdit,
    onView: (quotation: Quotation) => handleViewQuotation(quotation),
  });

  // Admins see only pending, partners and others see all
  const filteredQuotations = user.role === 'admin'
    ? quotations.filter(q => q.status === 'pending')
    : quotations;

  return (
    <div className="space-y-6">
      {/* Partner Data Filter - Only for partners */}
      {user.role === 'partner' && (
        <PartnerDataFilter
          user={user}
          quotations={quotations}
          invoices={[]} // Pass empty array if invoices not available in this view
          title="Quotations Data Analysis & Export"
        />
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {user.role === 'admin' ? 'Quotation Approvals' : 'My Quotations'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {user.role === 'admin' 
              ? 'Review and approve pending quotations' 
              : 'Manage your quotations and generate invoices'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {user.role === 'admin' && (
            <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                onClick={() => setViewMode('table')}
                className="gap-1.5"
                title="Table View"
              >
                <List size={14} />
                <span className="text-xs font-medium">Table</span>
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                onClick={() => setViewMode('cards')}
                className="gap-1.5"
                title="Card View"
              >
                <Grid size={14} />
                <span className="text-xs font-medium">Cards</span>
              </Button>
            </div>
          )}
          {(user.role === 'sales_director' || user.role === 'sales_agent') && (
            <Button 
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium gap-2" 
              onClick={() => setActiveTab('create')}
              title="Create New Quotation"
            >
              <Plus size={16} />
              <span>Create Quotation</span>
            </Button>
          )}
        </div>
      </div>
      
      {user.role === 'admin' && viewMode === 'cards' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {filteredQuotations.length} Pending Quotation{filteredQuotations.length === 1 ? '' : 's'}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuotations.map((quotation) => (
              <QuotationApprovalCard
                key={quotation.id}
                quotation={quotation}
                onApprove={onApprove!}
                onReject={handleRequestReject}
                onView={handleViewQuotation}
              />
            ))}
          </div>
        </div>
      ) : (
        <EnhancedSearchableTable
          title={`${filteredQuotations.length} Quotation${filteredQuotations.length === 1 ? '' : 's'}`}
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
          onExport={handleExport}
          showExport={true}
          showRefresh={true}
        />
      )}
      
      <QuotationModal
        open={modalOpen}
        quotation={modalQuotation}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        user={user}
        viewOnly={user.role === 'admin' || user.role === 'partner'}
      />

      <RejectQuotationModal
        open={rejectionModalOpen}
        quotation={quotationToReject}
        onClose={() => setRejectionModalOpen(false)}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
};

export default QuotationsView;
