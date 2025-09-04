
import React, { useState } from 'react';
import InvoiceGenerator from '@/components/InvoiceGenerator';
import SearchableTable from '@/components/SearchableTable';
import PartnerDataFilter from '@/components/partner/PartnerDataFilter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Printer, Grid, List } from 'lucide-react';
import { InvoiceData } from '@/types/invoice';
import { User, Quotation } from '@/types';
import InvoiceModal from '../modals/InvoiceModal';
import AdminInvoiceCard from '../admin/AdminInvoiceCard';

interface InvoicesViewProps {
  user: User;
  invoices: InvoiceData[];
  onSave: (invoice: InvoiceData) => void;
  onEdit: (invoice: InvoiceData) => void;
  onPrint: (invoice: InvoiceData) => void;
  setActiveTab: (tab: string) => void;
  quotations: Quotation[];
  invoiceQuotation: Quotation | null;
  onInvoiceQuotationClear: () => void;
}

const InvoicesView = ({
  user, invoices, onSave, onEdit, onPrint, setActiveTab, quotations, invoiceQuotation, onInvoiceQuotationClear
}: InvoicesViewProps) => {
  const [modalInvoice, setModalInvoice] = useState<InvoiceData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const handleEdit = (invoice: InvoiceData) => {
    setModalInvoice(invoice);
    setModalOpen(true);
  };

  const handleSave = (updatedInvoice: InvoiceData) => {
    onEdit(updatedInvoice);
    setModalOpen(false);
  };

  const handleViewInvoice = (invoice: InvoiceData) => {
    setModalInvoice(invoice);
    setModalOpen(true);
  };

  const handleExport = (data: InvoiceData[] = displayedInvoices) => {
    try {
      // Generate CSV content with proper escaping
      let csvContent = 'Invoice Number,Client,Amount (USD),Currency,Status,Due Date,Created Date\n';
      
      data.forEach(invoice => {
        // Properly escape CSV values to handle commas and quotes
        const escapeCSV = (value: string | null | undefined) => {
          if (!value) return '';
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        };
        
        const invoiceNumber = escapeCSV(invoice.invoiceNumber);
        const client = escapeCSV(invoice.clientName);
        const amount = invoice.totalAmount || 0;
        const currency = escapeCSV(invoice.currency || 'USD');
        const status = escapeCSV(invoice.status);
        const dueDate = invoice.dueDate || '';
        const createdDate = new Date(invoice.createdAt).toLocaleDateString();
        
        csvContent += `${invoiceNumber},${client},${amount},${currency},${status},${dueDate},${createdDate}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `invoices-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show success notification
        console.log(`Successfully exported ${data.length} invoices to CSV`);
      }
    } catch (error) {
      console.error('Error exporting invoices to CSV:', error);
      alert('Failed to export invoices. Please try again.');
    }
  };

  const displayedInvoices = invoices;

  // Helper function to get quotation volume for an invoice
  const getQuotationVolume = (invoice: InvoiceData) => {
    const quotation = quotations.find(q => q.id === invoice.quotationId);
    if (quotation) {
      if (quotation.totalVolumeKg) {
        return `${quotation.totalVolumeKg.toLocaleString()} kg`;
      }
      
      try {
        const parsed = JSON.parse(quotation.volume);
        if (Array.isArray(parsed)) {
          const total = parsed.reduce((sum: number, c: any) => sum + (Number(c.quantityKg) || 0), 0);
          return `${total.toLocaleString()} kg`;
        }
      } catch (e) {
        const vol = Number(quotation.volume);
        if (!isNaN(vol)) {
          return `${vol.toLocaleString()} kg`;
        }
      }
      return quotation.volume || 'N/A';
    }
    
    // Fallback to calculating from invoice items
    const totalKg = invoice.items?.reduce((sum, item) => sum + (item.quantityKg || 0), 0) || 0;
    return `${totalKg.toLocaleString()} kg`;
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
    // Actions column moved to first position for easy access
    {
      key: 'actions',
      label: 'Actions',
      minWidth: '120px',
      render: (_: any, row: InvoiceData) => (
        <div className="flex gap-2">
          {row.status === 'paid' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onPrint(row)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Print Invoice"
            >
              <Printer size={16} />
            </Button>
          )}
          {row.status !== 'paid' && user.role !== 'partner' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEdit(row)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Edit Invoice"
            >
              <Edit size={16} />
            </Button>
          )}
          {user.role === 'partner' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onPrint(row)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Print Invoice"
            >
              <Printer size={16} />
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      minWidth: '90px',
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
      key: 'invoiceNumber', 
      label: 'Invoice #',
      minWidth: '100px',
      render: (value: string) => (
        <div className="font-medium text-gray-900 text-sm">{value}</div>
      )
    },
    { 
      key: 'clientName', 
      label: 'Client',
      minWidth: '120px',
      render: (value: string) => (
        <div className="font-medium text-gray-700 text-sm truncate" title={value}>{value}</div>
      )
    },
    {
      key: 'volume',
      label: 'Volume',
      minWidth: '80px',
      render: (_: any, row: InvoiceData) => (
        <div className="font-medium text-blue-600 text-sm text-center">
          {getQuotationVolume(row)}
        </div>
      )
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      minWidth: '100px',
      render: (value: number, row: InvoiceData) => (
        <div className="font-medium text-blue-600 text-sm text-right whitespace-nowrap">
          {row.currency} {value.toLocaleString()}
        </div>
      )
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      minWidth: '90px',
      render: (value: string) => (
        <div className="text-gray-600 text-sm">
          {new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
        </div>
      )
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      minWidth: '90px',
      render: (value: string) => (
        <div className="text-gray-600 text-sm">
          {value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : 'N/A'}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Partner Data Filter - Only for partners */}
      {user.role === 'partner' && (
        <PartnerDataFilter
          user={user}
          quotations={quotations}
          invoices={invoices}
          title="Invoices Data Analysis & Export"
        />
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Invoices</h2>
          <p className="text-muted-foreground mt-1">Manage and track all generated invoices</p>
        </div>
        {user.role === 'admin' && (
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              onClick={() => setViewMode('table')}
            >
              <List size={16} />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              onClick={() => setViewMode('cards')}
            >
              <Grid size={16} />
            </Button>
          </div>
        )}
      </div>
      
      {user.role === 'admin' && viewMode === 'cards' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {displayedInvoices.length} Invoice{displayedInvoices.length === 1 ? '' : 's'}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedInvoices.map((invoice) => (
              <AdminInvoiceCard
                key={invoice.id}
                invoice={invoice}
                onView={handleViewInvoice}
                onPrint={onPrint}
              />
            ))}
          </div>
        </div>
      ) : (
        <SearchableTable
          title={`${displayedInvoices.length} Generated Invoice${displayedInvoices.length === 1 ? '' : 's'}`}
          data={displayedInvoices}
          columns={invoiceColumns}
          searchFields={['invoiceNumber', 'clientName', 'status']}
          onDownload={handleExport}
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
      )}
      
      <InvoiceModal
        open={modalOpen}
        invoice={modalInvoice}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onPrint={onPrint}
      />
    </div>
  );
};

export default InvoicesView;
