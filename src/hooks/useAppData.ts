import { useState } from 'react';
import { Quotation, User } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { mockQuotations, mockUsers, mockInvoices } from '@/data/mockData';
import { useNotifications } from '@/hooks/useNotifications';
import { useSystemNotifications } from '@/hooks/useSystemNotifications';
import { useOverdueNotifications } from '@/components/hooks/useOverdueNotifications';
import { useAuth } from '@/contexts/AuthContext';

export const useAppData = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [invoices, setInvoices] = useState<InvoiceData[]>(mockInvoices);
  const [printPreview, setPrintPreview] = useState<InvoiceData | null>(null);
  const [invoiceQuotation, setInvoiceQuotation] = useState<Quotation | null>(null);
  const {
    notifyQuotationApproved,
    notifyQuotationRejected,
    notifyQuotationCreated,
    notifyQuotationUpdated,
    notifyInvoiceCreated,
    notifyInvoiceUpdated,
    notifyInvoiceGenerated,
    notifyInvoicePrinted,
    notifyUserCreated,
    notifyUserUpdated,
    notifyUserDeleted,
  } = useNotifications();
  
  const systemNotifications = useSystemNotifications();
  
  // Set up overdue notifications
  useOverdueNotifications({ quotations, invoices });

  const handleApproveQuotation = (id: string) => {
    if (!user) return;
    const quotation = quotations.find(q => q.id === id);
    if (!quotation) return;
    
    setQuotations(prev =>
      prev.map(q =>
        q.id === id
          ? { ...q, status: 'won' as const, approvedBy: user.name, approvedAt: new Date().toISOString() }
          : q
      )
    );
    notifyQuotationApproved(quotation, { user });
    systemNotifications.notifyQuotationApproved(quotation, { user });
  };

  const handleRejectQuotation = (id: string, reason: string) => {
    const quotation = quotations.find(q => q.id === id);
    if (!quotation) return;
    
    setQuotations(prev =>
      prev.map(q => {
        if (q.id === id) {
          const newRemarks = [q.remarks, `Reason for loss: ${reason}`].filter(Boolean).join('\n\n');
          return { ...q, status: 'lost' as const, remarks: newRemarks };
        }
        return q;
      })
    );
    notifyQuotationRejected(quotation, reason, { user });
    systemNotifications.notifyQuotationRejected(quotation, reason, { user });
  };

  const handleQuotationCreated = (newQuotationData: Quotation) => {
    setQuotations(prev => [newQuotationData, ...prev]);
    notifyQuotationCreated(newQuotationData, { user });
    systemNotifications.notifyQuotationCreated(newQuotationData, { user });
    setActiveTab('quotations');
  };

  const handleGenerateInvoiceFromQuotation = (quotation: Quotation) => {
    setInvoiceQuotation(quotation);
    setActiveTab('invoices');
    // Notification will be sent when invoice is actually created
  };

  const handleSaveInvoice = (invoice: InvoiceData) => {
    setInvoices(prev => [invoice, ...prev]);

    if (invoice.quotationId) {
      const quotation = quotations.find(q => q.id === invoice.quotationId);
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
      
      if (quotation) {
        notifyInvoiceGenerated(quotation, invoice, { user });
      }
    } else {
      notifyInvoiceCreated(invoice, { user });
      systemNotifications.notifyInvoiceCreated(invoice, { user });
    }
    
    // Clear the invoice quotation after saving
    setInvoiceQuotation(null);
  };

  const handleEditInvoice = (updatedInvoice: InvoiceData) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    ));
    notifyInvoiceUpdated(updatedInvoice, { user });
  };

  const handlePrintInvoice = (invoice: InvoiceData) => {
    setPrintPreview(invoice);
    notifyInvoicePrinted(invoice, { user });
  };

  const handleEditQuotation = (updatedQuotation: Quotation) => {
    setQuotations(prev => prev.map(q => 
      q.id === updatedQuotation.id ? updatedQuotation : q
    ));
    notifyQuotationUpdated(updatedQuotation, { user });
  };

  const handleEditUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    ));
    notifyUserUpdated(updatedUser, { user });
  };
  
  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (userToDelete) {
      notifyUserDeleted(userToDelete.name, { user });
    }
  };

  const handleCreateUser = (newUser: Omit<User, 'id' | 'createdAt'>) => {
    const userWithId: User = {
      ...newUser,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    } as User;
    setUsers(prev => [userWithId, ...prev]);
    notifyUserCreated(userWithId, { user });
    systemNotifications.notifyUserCreated(userWithId, { user });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'invoices') {
      setInvoiceQuotation(null);
    }
  };

  return {
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
    systemNotifications,
  };
};
