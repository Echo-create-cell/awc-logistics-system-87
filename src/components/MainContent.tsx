
import React from 'react';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';

import DashboardView from '@/components/views/DashboardView';
import UsersView from '@/components/views/UsersView';
import QuotationsView from '@/components/views/QuotationsView';
import CreateQuotationView from '@/components/views/CreateQuotationView';
import InvoicesView from '@/components/views/InvoicesView';
import ReportsView from '@/components/views/ReportsView';

interface MainContentProps {
    activeTab: string;
    user: User;
    quotations: Quotation[];
    invoices: InvoiceData[];
    users: User[];
    invoiceQuotation: Quotation | null;
    
    handleApproveQuotation: (id: string) => void;
    handleRejectQuotation: (id: string, reason: string) => void;
    handleEditQuotation: (quotation: Quotation) => void;
    handleGenerateInvoiceFromQuotation: (quotation: Quotation) => void;
    setActiveTab: (tab: string) => void;
    
    handleQuotationCreated: (quotation: Quotation) => void;

    handleSaveInvoice: (invoice: InvoiceData) => void;
    handleEditInvoice: (invoice: InvoiceData) => void;
    handlePrintInvoice: (invoice: InvoiceData) => void;
    setInvoiceQuotation: (quotation: Quotation | null) => void;

    handleEditUser: (user: User) => void;
    handleDeleteUser: (userId: string) => void;
    handleCreateUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
}

const MainContent = (props: MainContentProps) => {
  const {
    activeTab,
    user,
    quotations,
    invoices,
    users,
    invoiceQuotation,
    handleApproveQuotation,
    handleRejectQuotation,
    handleEditQuotation,
    handleGenerateInvoiceFromQuotation,
    setActiveTab,
    handleQuotationCreated,
    handleSaveInvoice,
    handleEditInvoice,
    handlePrintInvoice,
    setInvoiceQuotation,
    handleEditUser,
    handleDeleteUser,
    handleCreateUser,
  } = props;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            userRole={user.role}
            quotations={quotations}
            setActiveTab={setActiveTab}
          />
        );
      case 'users':
        return (
          <UsersView
            users={users}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onCreate={handleCreateUser}
          />
        );
      case 'quotations':
        return (
          <QuotationsView
            user={user}
            quotations={quotations}
            setActiveTab={setActiveTab}
            onInvoiceFromQuotation={handleGenerateInvoiceFromQuotation}
            onEdit={handleEditQuotation}
            onApprove={handleApproveQuotation}
            onReject={handleRejectQuotation}
          />
        );
      case 'create':
        return (
          <CreateQuotationView
            user={user}
            onQuotationCreated={handleQuotationCreated}
            setActiveTab={setActiveTab}
          />
        );
      case 'invoices':
        return (
          <InvoicesView
            user={user}
            invoices={invoices}
            quotations={quotations}
            onSave={handleSaveInvoice}
            onEdit={handleEditInvoice}
            onPrint={handlePrintInvoice}
            setActiveTab={setActiveTab}
            invoiceQuotation={invoiceQuotation}
            onInvoiceQuotationClear={() => setInvoiceQuotation(null)}
          />
        );
      case 'reports':
        return <ReportsView />;
      default:
        return <div>Content not found</div>;
    }
  };

  return <div className="animate-fade-in">{renderContent()}</div>;
};

export default MainContent;
