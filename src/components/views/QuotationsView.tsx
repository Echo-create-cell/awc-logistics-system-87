
import React, { useState } from 'react';
import { showPersistentToast } from '@/components/ui/persistent-toast';
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
  initialFilter?: 'overdue' | 'pending' | 'all';
}

const QuotationsView = ({
  user, quotations, setActiveTab, onInvoiceFromQuotation, onEdit, onApprove, onReject, initialFilter = 'all'
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

  const handleSaveRejectionDraft = (reason: string) => {
    // Save draft functionality - return to agent for modification
    if (quotationToReject && onReject) {
      // Pass true as third parameter to indicate draft save
      (onReject as any)(quotationToReject.id, reason, true);
    }
    setRejectionModalOpen(false);
    setQuotationToReject(null);
  };

  const handleViewQuotation = (quotation: Quotation) => {
    setModalQuotation(quotation);
    setModalOpen(true);
  };

  const handleExport = () => {
    // All users can export the quotations they see (controlled by RLS)
    const filteredQuotations = quotations;

    try {
      // Generate CSV content with proper escaping
      let csvContent = 'Date,Client,Destination,Status,Amount (USD),Sent By,Approved By\n';
      
      filteredQuotations.forEach(q => {
        // Properly escape CSV values to handle commas and quotes
        const escapeCSV = (value: string | null | undefined) => {
          if (!value) return '';
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        };
        
        const date = new Date(q.createdAt).toLocaleDateString();
        const client = escapeCSV(q.clientName);
        const destination = escapeCSV(q.destination);
        const status = escapeCSV(q.status);
        const amount = q.clientQuote || 0;
        const sentBy = escapeCSV(q.quoteSentBy);
        const approvedBy = escapeCSV(q.approvedBy || 'N/A');
        
        csvContent += `${date},${client},${destination},${status},${amount},${sentBy},${approvedBy}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `quotations-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show success notification
        console.log(`Successfully exported ${filteredQuotations.length} quotations to CSV`);
      }
    } catch (error) {
      console.error('Error exporting quotations to CSV:', error);
      showPersistentToast({
        title: 'Quotation Export Failed',
        description: 'Failed to export quotations. Please try again.',
        variant: 'error',
        category: 'Export',
        persistent: false
      });
    }
  };

  const quotationColumns = getQuotationColumns({
    user,
    onApprove,
    onReject: (quotation: Quotation) => handleRequestReject(quotation),
    onInvoiceFromQuotation,
    onEdit: handleEdit,
    onView: (quotation: Quotation) => handleViewQuotation(quotation),
  });

  // Filter quotations based on initial filter
  const getFilteredQuotations = () => {
    if (initialFilter === 'overdue') {
      // Show quotations that are overdue (pending for more than 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return quotations.filter(q => 
        q.status === 'pending' && new Date(q.createdAt) < sevenDaysAgo
      )
    } else if (initialFilter === 'pending') {
      // Show all pending quotations
      return quotations.filter(q => q.status === 'pending')
    }
    // Default: show all quotations
    return quotations
  }

  const filteredQuotations = getFilteredQuotations()

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
            {user.role === 'admin' || user.role === 'finance_officer' ? 'All Quotations' : 'Quotations'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {user.role === 'admin' 
              ? 'Review and approve all quotations' 
              : user.role === 'finance_officer'
              ? 'View and analyze all quotations for financial reporting'
              : user.role === 'sales_agent'
              ? 'View quotations and generate invoices from approved ones'
              : 'Manage quotations and generate invoices'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {(user.role === 'admin' || user.role === 'finance_officer') && (
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
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
      
      {(user.role === 'admin' || user.role === 'finance_officer') && viewMode === 'cards' ? (
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
        onSave={handleSaveRejectionDraft}
      />
    </div>
  );
};

export default QuotationsView;
