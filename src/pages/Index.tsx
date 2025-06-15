import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Sidebar from '@/components/Sidebar';
import InvoicePrintPreview from '@/components/InvoicePrintPreview';
import { mockQuotations, mockUsers } from '@/data/mockData';
import { Quotation, User } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';

import DashboardView from '@/components/views/DashboardView';
import UsersView from '@/components/views/UsersView';
import QuotationsView from '@/components/views/QuotationsView';
import CreateQuotationView from '@/components/views/CreateQuotationView';
import InvoicesView from '@/components/views/InvoicesView';
import ReportsView from '@/components/views/ReportsView';

const Index = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [printPreview, setPrintPreview] = useState<InvoiceData | null>(null);
  const { toast } = useToast();

  if (!user) {
    return <LoginForm />;
  }

  const handleApproveQuotation = (id: string) => {
    setQuotations(prev =>
      prev.map(q =>
        q.id === id
          ? { ...q, status: 'won' as const, approvedBy: user.name, approvedAt: new Date().toISOString() }
          : q
      )
    );
    toast({
      title: "Quotation Approved",
      description: "The quotation has been successfully approved.",
    });
  };

  const handleRejectQuotation = (id: string) => {
    setQuotations(prev =>
      prev.map(q =>
        q.id === id
          ? { ...q, status: 'lost' as const }
          : q
      )
    );
    toast({
      title: "Quotation Rejected",
      description: "The quotation has been rejected.",
      variant: "destructive",
    });
  };

  const handleQuotationCreated = (newQuotationData: Quotation) => {
    setQuotations(prev => [newQuotationData, ...prev]);
    toast({
      title: "Quotation Created",
      description: `Quotation for ${newQuotationData.clientName} has been saved.`,
    });
    setActiveTab('quotations');
  };

  const handleSaveInvoice = (invoice: InvoiceData) => {
    setInvoices(prev => [...prev, invoice]);
  };

  const handlePrintInvoice = (invoice: InvoiceData) => {
    setPrintPreview(invoice);
  };

  const handleViewQuotation = (quotation: Quotation) => {
    toast({
      title: "Quotation Details",
      description: `Viewing quotation ${quotation.id}`,
    });
  };

  const handleViewInvoice = (invoice: InvoiceData) => {
    setPrintPreview(invoice);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            userRole={user.role}
            quotations={quotations}
            onApprove={handleApproveQuotation}
            onReject={handleRejectQuotation}
            onView={handleViewQuotation}
          />
        );
      case 'users':
        return <UsersView users={users} />;
      case 'quotations':
        return (
          <QuotationsView
            user={user}
            quotations={quotations}
            onView={handleViewQuotation}
            setActiveTab={setActiveTab}
          />
        );
      case 'create':
        return (
          <CreateQuotationView
            user={user}
            onQuotationCreated={handleQuotationCreated}
          />
        );
      case 'invoices':
        return (
          <InvoicesView
            user={user}
            invoices={invoices}
            onSave={handleSaveInvoice}
            onPrint={handlePrintInvoice}
            onView={handleViewInvoice}
            setActiveTab={setActiveTab}
          />
        );
      case 'reports':
        return <ReportsView />;
      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar
        userRole={user.role}
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
        {renderContent()}
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
