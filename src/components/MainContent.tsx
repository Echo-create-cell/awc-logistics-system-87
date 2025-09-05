
import React from 'react';
import DashboardView from './views/DashboardView';
import QuotationsView from './views/QuotationsView';
import CreateQuotationView from './views/CreateQuotationView';
import InvoicesView from './views/InvoicesView';
import UsersView from './views/UsersView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';
import DocumentsView from './views/DocumentsView';
import UserActivityView from './views/UserActivityView';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';

interface MainContentProps {
  user: User;
  activeTab: string;
  quotations: Quotation[];
  users: User[];
  invoices: InvoiceData[];
  onTabChange: (tab: string) => void;
  onApproveQuotation: (id: string) => void;
  onRejectQuotation: (id: string, reason: string) => void;
  onQuotationCreated: (quotation: Quotation) => void;
  onGenerateInvoiceFromQuotation: (quotation: Quotation) => void;
  onSaveInvoice: (invoice: InvoiceData) => void;
  onEditInvoice: (invoice: InvoiceData) => void;
  onPrintInvoice: (invoice: InvoiceData) => void;
  onEditQuotation: (quotation: Quotation) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onCreateUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  invoiceQuotation: Quotation | null;
  onInvoiceQuotationClear: () => void;
}

const MainContent = ({
  user,
  activeTab,
  quotations,
  users,
  invoices,
  onTabChange,
  onApproveQuotation,
  onRejectQuotation,
  onQuotationCreated,
  onGenerateInvoiceFromQuotation,
  onSaveInvoice,
  onEditInvoice,
  onPrintInvoice,
  onEditQuotation,
  onEditUser,
  onDeleteUser,
  onCreateUser,
  invoiceQuotation,
  onInvoiceQuotationClear,
}: MainContentProps) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            user={user} 
            quotations={quotations} 
            invoices={invoices}
            users={users}
            onTabChange={onTabChange}
          />
        );
      case 'quotations':
        return (
          <QuotationsView
            user={user}
            quotations={quotations}
            setActiveTab={onTabChange}
            onInvoiceFromQuotation={user.role === 'partner' ? undefined : onGenerateInvoiceFromQuotation}
            onEdit={user.role === 'partner' ? undefined : onEditQuotation}
            onApprove={user.role === 'admin' ? onApproveQuotation : undefined}
            onReject={user.role === 'admin' ? onRejectQuotation : undefined}
          />
        );
      case 'create':
        return (
          <CreateQuotationView
            user={user}
            onQuotationCreated={onQuotationCreated}
          />
        );
      case 'invoices':
        return (
          <InvoicesView
            user={user}
            invoices={invoices}
            onSave={onSaveInvoice}
            onEdit={user.role === 'partner' ? undefined : onEditInvoice}
            onPrint={onPrintInvoice}
            setActiveTab={onTabChange}
            quotations={quotations}
            invoiceQuotation={invoiceQuotation}
            onInvoiceQuotationClear={onInvoiceQuotationClear}
          />
        );
      case 'users':
        return (
          <UsersView
            users={users}
          />
        );
      case 'activity':
        if (user.role === 'admin') {
          return (
            <UserActivityView
              user={user}
              users={users}
              quotations={quotations}
              invoices={invoices}
            />
          );
        } else {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="heading-sm">Access Restricted</h2>
                <p className="text-body-sm">You don't have permission to view user activity.</p>
              </div>
            </div>
          );
        }
      case 'reports':
        // Allow finance_officer, sales_director, admin, and partner to access reports
        if (user.role === 'finance_officer' || user.role === 'sales_director' || user.role === 'admin' || user.role === 'partner') {
          return <ReportsView user={user} quotations={quotations} invoices={invoices} />;
        } else {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h2 className="heading-sm">Access Restricted</h2>
                <p className="text-body-sm">You don't have permission to view reports.</p>
              </div>
            </div>
          );
        }
      case 'settings':
        return <SettingsView />;
      case 'documents':
        return <DocumentsView />;
      default:
        return (
          <DashboardView 
            user={user} 
            quotations={quotations} 
            invoices={invoices}
            users={users}
            onTabChange={onTabChange}
          />
        );
    }
  };

  return (
    <div className="flex-1 p-6 bg-background overflow-auto">
      {renderContent()}
    </div>
  );
};

export default MainContent;
