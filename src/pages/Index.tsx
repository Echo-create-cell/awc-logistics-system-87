
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Sidebar from '@/components/Sidebar';
import InvoicePrintPreview from '@/components/InvoicePrintPreview';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/hooks/useAppData';
import MainContent from '@/components/MainContent';

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    activeTab,
    quotations,
    users,
    invoices,
    printPreview,
    invoiceQuotation,
    handleApproveQuotation,
    handleRejectQuotation,
    handleQuotationCreated,
    handleGenerateInvoiceFromQuotation,
    handleSaveInvoice,
    handleEditInvoice,
    handlePrintInvoice,
    handleEditQuotation,
    handleEditUser,
    handleDeleteUser,
    handleCreateUser,
    handleTabChange,
    setPrintPreview,
    setActiveTab,
    setInvoiceQuotation,
  } = useAppData();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        userRole={user.role}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <div className="flex-1 p-6 lg:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, <span className="fancy-gradient-text">{user.name}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your business today.
          </p>
        </div>
        <MainContent
          activeTab={activeTab}
          user={user}
          quotations={quotations}
          invoices={invoices}
          users={users}
          invoiceQuotation={invoiceQuotation}
          onApproveQuotation={handleApproveQuotation}
          onRejectQuotation={handleRejectQuotation}
          onEditQuotation={handleEditQuotation}
          onGenerateInvoiceFromQuotation={handleGenerateInvoiceFromQuotation}
          onTabChange={handleTabChange}
          onQuotationCreated={handleQuotationCreated}
          onSaveInvoice={handleSaveInvoice}
          onEditInvoice={handleEditInvoice}
          onPrintInvoice={handlePrintInvoice}
          onInvoiceQuotationClear={() => setInvoiceQuotation(null)}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          onCreateUser={handleCreateUser}
        />
      </div>

      {printPreview && (
        <InvoicePrintPreview
          invoice={printPreview}
          onClose={() => setPrintPreview(null)}
          onPrint={() => {
            setPrintPreview(null);
            toast({
              title: "Invoice Printed",
              description: "Invoice has been sent to printer.",
            });
          }}
        />
      )}
    </div>
  );
};

export default Index;
