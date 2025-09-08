
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Sidebar from '@/components/Sidebar';
import InvoicePrintPreview from '@/components/InvoicePrintPreview';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/hooks/useAppData';
import MainContent from '@/components/MainContent';
import DailyNotificationSystem from '@/components/notifications/DailyNotificationSystem';
import { NotificationPanel } from '@/components/layout/NotificationPanel';
import { Toaster } from '@/components/ui/toaster';
import { PersistentToaster } from '@/components/ui/persistent-toast';
import { SystemNotificationProvider } from '@/components/providers/SystemNotificationProvider';


const IndexContent = ({ user, toast, activeTab, quotations, users, invoices, printPreview, invoiceQuotation, quotationFilter, invoiceFilter, handleApproveQuotation, handleRejectQuotation, handleQuotationCreated, handleGenerateInvoiceFromQuotation, handleSaveInvoice, handleEditInvoice, handlePrintInvoice, handleEditQuotation, handleEditUser, handleDeleteUser, handleCreateUser, handleTabChange, setPrintPreview, setActiveTab, setInvoiceQuotation, navigateToQuotations, navigateToInvoices }: any) => {

  return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Sidebar
        userRole={user.role}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome back, {user.name}
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  {user.role === 'admin' && "Manage your entire logistics operation with comprehensive insights"}
                  {user.role === 'sales_director' && "Oversee sales performance and team activities"}
                  {user.role === 'sales_agent' && "Create quotations and manage client relationships"}
                  {user.role === 'finance_officer' && "Monitor financial performance and generate reports"}
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {user.role.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                {/* System Notifications Panel */}
                <NotificationPanel />
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
              
              {/* Mobile notifications - show on smaller screens */}
              <div className="lg:hidden flex items-center space-x-2">
                <NotificationPanel />
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          <div className="animate-fade-in">
            <MainContent
              activeTab={activeTab}
              user={user}
              quotations={quotations}
              invoices={invoices}
              users={users}
              invoiceQuotation={invoiceQuotation}
              quotationFilter={quotationFilter}
              invoiceFilter={invoiceFilter}
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
        </div>
      </div>

      {printPreview && (
        <InvoicePrintPreview
          invoice={printPreview}
          onClose={() => setPrintPreview(null)}
          onPrint={() => {
            setPrintPreview(null);
            toast({
              title: "Invoice Printed",
              description: "Invoice has been sent to printer successfully.",
            });
          }}
        />
      )}
      
      {/* Daily Notification System */}
      <DailyNotificationSystem 
        quotations={quotations}
        invoices={invoices}
      />

      {/* Toast Notification Systems */}
      <Toaster />
      <PersistentToaster />
      </div>
  );
};

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
    quotationFilter,
    invoiceFilter,
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
    navigateToQuotations,
    navigateToInvoices,
  } = useAppData();
  
  if (!user) {
    return <LoginForm />;
  }

  return (
    <SystemNotificationProvider
      quotations={quotations}
      invoices={invoices}
      users={users}
      navigationCallbacks={{
        onNavigateToQuotations: navigateToQuotations,
        onNavigateToInvoices: navigateToInvoices
      }}
    >
      <IndexContent 
        user={user}
        toast={toast}
        activeTab={activeTab}
        quotations={quotations}
        users={users}
        invoices={invoices}
        printPreview={printPreview}
        invoiceQuotation={invoiceQuotation}
        quotationFilter={quotationFilter}
        invoiceFilter={invoiceFilter}
        handleApproveQuotation={handleApproveQuotation}
        handleRejectQuotation={handleRejectQuotation}
        handleQuotationCreated={handleQuotationCreated}
        handleGenerateInvoiceFromQuotation={handleGenerateInvoiceFromQuotation}
        handleSaveInvoice={handleSaveInvoice}
        handleEditInvoice={handleEditInvoice}
        handlePrintInvoice={handlePrintInvoice}
        handleEditQuotation={handleEditQuotation}
        handleEditUser={handleEditUser}
        handleDeleteUser={handleDeleteUser}
        handleCreateUser={handleCreateUser}
        handleTabChange={handleTabChange}
        setPrintPreview={setPrintPreview}
        setActiveTab={setActiveTab}
        setInvoiceQuotation={setInvoiceQuotation}
        navigateToQuotations={navigateToQuotations}
        navigateToInvoices={navigateToInvoices}
      />
    </SystemNotificationProvider>
  );
};

export default Index;
