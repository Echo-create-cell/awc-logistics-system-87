
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
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar
        userRole={user.role}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user.name}
          </h1>
          <p className="text-slate-600">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <MainContent
          activeTab={activeTab}
          user={user}
          quotations={quotations}
          invoices={invoices}
          users={users}
          invoiceQuotation={invoiceQuotation}
          handleApproveQuotation={handleApproveQuotation}
          handleRejectQuotation={handleRejectQuotation}
          handleEditQuotation={handleEditQuotation}
          handleGenerateInvoiceFromQuotation={handleGenerateInvoiceFromQuotation}
          setActiveTab={setActiveTab}
          handleQuotationCreated={handleQuotationCreated}
          handleSaveInvoice={handleSaveInvoice}
          handleEditInvoice={handleEditInvoice}
          handlePrintInvoice={handlePrintInvoice}
          setInvoiceQuotation={setInvoiceQuotation}
          handleEditUser={handleEditUser}
          handleDeleteUser={handleDeleteUser}
          handleCreateUser={handleCreateUser}
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
