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

import UserModal from "@/components/modals/UserModal";
import QuotationModal from "@/components/modals/QuotationModal";
import InvoiceModal from "@/components/modals/InvoiceModal";

const Index = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [printPreview, setPrintPreview] = useState<InvoiceData | null>(null);
  const [invoiceQuotation, setInvoiceQuotation] = useState<Quotation | null>(null);
  const [editQuotation, setEditQuotation] = useState<Quotation | null>(null);
  const [deleteQuotationId, setDeleteQuotationId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
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

  // Invoice from scratch or from quotation
  const handleGenerateInvoiceFromQuotation = (quotation: Quotation) => {
    setInvoiceQuotation(quotation);
    setActiveTab('invoices');
  };

  // Save new invoice, link to quotation if necessary
  const handleSaveInvoice = (invoice: InvoiceData) => {
    setInvoices(prev => [...prev, invoice]);

    // Link invoice and quotation
    if (invoice.quotationId) {
      setQuotations((prev) => prev.map(q =>
        q.id === invoice.quotationId
          ? {
              ...q,
              linkedInvoiceIds: q.linkedInvoiceIds
                ? [...q.linkedInvoiceIds, invoice.id]
                : [invoice.id],
            }
          : q
      ));
    }
    toast({
      title: "Invoice Saved",
      description: `Invoice ${invoice.invoiceNumber} has been created successfully.`,
    });
  };

  const handlePrintInvoice = (invoice: InvoiceData) => {
    setPrintPreview(invoice);
  };

  const handleViewQuotation = (quotation: Quotation) => {
    setEditQuotation(quotation);
    // simply open modal, don't do alert or toast here
  };

  const handleViewInvoice = (invoice: InvoiceData) => {
    setPrintPreview(invoice);
  };

  const handleEditQuotation = (quotation: Quotation) => {
    setEditQuotation(quotation);
    // The edit modal is opened via QuotationsView, not here
  };
  const handleDeleteQuotation = (id: string) => {
    setDeleteQuotationId(id);
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      setQuotations(prev => prev.filter(q => q.id !== id));
      toast({
        title: "Quotation Deleted",
        description: "Quotation was successfully deleted.",
      });
      setDeleteQuotationId(null);
    }
  };

  const handleEditUser = (userObj: User) => {
    setEditUser(userObj);
    // Edit handled in UsersView modal
  };
  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({
        title: "User Deleted",
        description: "User was successfully deleted.",
      });
      setDeleteUserId(null);
    }
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
        return (
          <UsersView
            users={users}
            onView={(userObj) => alert(`View User: ${userObj.name}`)}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        );
      case 'quotations':
        return (
          <QuotationsView
            user={user}
            quotations={quotations}
            onView={handleViewQuotation}
            setActiveTab={setActiveTab}
            onInvoiceFromQuotation={handleGenerateInvoiceFromQuotation}
            onEdit={handleEditQuotation}
            onDelete={handleDeleteQuotation}
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
            quotations={quotations}
            onSave={handleSaveInvoice}
            onPrint={handlePrintInvoice}
            onView={handleViewInvoice}
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

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar
        userRole={user.role}
        activeTab={activeTab}
        onTabChange={(tab: string) => {
          setActiveTab(tab);
          if (tab !== 'invoices') setInvoiceQuotation(null);
        }}
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
