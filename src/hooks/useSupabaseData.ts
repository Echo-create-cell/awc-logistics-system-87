import { useState, useEffect } from 'react';
import { Quotation, User } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { quotationService } from '@/services/quotationService';
import { invoiceService } from '@/services/invoiceService';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { useOverdueNotifications } from '@/components/hooks/useOverdueNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers } from '@/data/mockData'; // Keep users as mock for now

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [printPreview, setPrintPreview] = useState<InvoiceData | null>(null);
  const [invoiceQuotation, setInvoiceQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  
  const {
    notifyQuotationApproved,
    notifyQuotationRejected,
    notifyQuotationFeedback,
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
  
  const notificationManager = useNotificationManager();
  
  // Set up overdue notifications
  useOverdueNotifications({ quotations, invoices });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quotationsData, invoicesData] = await Promise.all([
        quotationService.getAll(),
        invoiceService.getAll(),
      ]);
      setQuotations(quotationsData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveQuotation = async (id: string) => {
    if (!user) return;
    const quotation = quotations.find(q => q.id === id);
    if (!quotation) return;
    
    try {
      const updatedQuotation = await quotationService.update(id, {
        status: 'won' as const,
        approvedBy: user.name,
        approvedAt: new Date().toISOString(),
      });
      
      setQuotations(prev => prev.map(q => q.id === id ? updatedQuotation : q));
      notifyQuotationApproved(quotation, { user });
      notificationManager.notifyQuotationApproved(quotation, { user });
    } catch (error) {
      console.error('Error approving quotation:', error);
    }
  };

  const handleRejectQuotation = async (id: string, reason: string, saveAsDraft = false) => {
    const quotation = quotations.find(q => q.id === id);
    if (!quotation) return;
    
    try {
      if (saveAsDraft) {
        // Save as draft - return to original agent for modification
        const draftRemarks = [quotation.remarks, `Draft Rejection Feedback: ${reason}`].filter(Boolean).join('\n\n');
        const updatedQuotation = await quotationService.update(id, {
          status: 'pending' as const,
          remarks: draftRemarks,
        });
        
        setQuotations(prev => prev.map(q => q.id === id ? updatedQuotation : q));
        notifyQuotationFeedback(quotation, reason, { user });
      } else {
        // Permanent rejection
        const newRemarks = [quotation.remarks, `Reason for loss: ${reason}`].filter(Boolean).join('\n\n');
        const updatedQuotation = await quotationService.update(id, {
          status: 'lost' as const,
          remarks: newRemarks,
        });
        
        setQuotations(prev => prev.map(q => q.id === id ? updatedQuotation : q));
        notifyQuotationRejected(quotation, reason, { user });
        notificationManager.notifyQuotationRejected(quotation, reason, { user });
      }
    } catch (error) {
      console.error('Error rejecting quotation:', error);
    }
  };

  const handleQuotationCreated = async (newQuotationData: Quotation) => {
    try {
      const createdQuotation = await quotationService.create(newQuotationData);
      setQuotations(prev => [createdQuotation, ...prev]);
      notifyQuotationCreated(createdQuotation, { user });
      notificationManager.notifyQuotationCreated(createdQuotation, { user });
      setActiveTab('quotations');
    } catch (error) {
      console.error('Error creating quotation:', error);
    }
  };

  const handleGenerateInvoiceFromQuotation = (quotation: Quotation) => {
    setInvoiceQuotation(quotation);
    setActiveTab('invoices');
  };

  const handleSaveInvoice = async (invoice: InvoiceData) => {
    try {
      const createdInvoice = await invoiceService.create(invoice);
      setInvoices(prev => [createdInvoice, ...prev]);

      if (invoice.quotationId) {
        const quotation = quotations.find(q => q.id === invoice.quotationId);
        if (quotation) {
          const updatedQuotation = await quotationService.update(quotation.id, {
            linkedInvoiceIds: quotation.linkedInvoiceIds
              ? [...quotation.linkedInvoiceIds, createdInvoice.id]
              : [createdInvoice.id],
          });
          
          setQuotations(prev => prev.map(q => q.id === quotation.id ? updatedQuotation : q));
          notifyInvoiceGenerated(quotation, createdInvoice, { user });
        }
      } else {
        notifyInvoiceCreated(createdInvoice, { user });
        notificationManager.notifyInvoiceCreated(createdInvoice, { user });
      }
      
      setInvoiceQuotation(null);
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const handleEditInvoice = async (updatedInvoice: InvoiceData) => {
    try {
      const updated = await invoiceService.update(updatedInvoice.id, updatedInvoice);
      setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updated : inv));
      notifyInvoiceUpdated(updated, { user });
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  const handlePrintInvoice = (invoice: InvoiceData) => {
    setPrintPreview(invoice);
    notifyInvoicePrinted(invoice, { user });
  };

  const handleEditQuotation = async (updatedQuotation: Quotation) => {
    try {
      const updated = await quotationService.update(updatedQuotation.id, updatedQuotation);
      setQuotations(prev => prev.map(q => q.id === updatedQuotation.id ? updated : q));
      notifyQuotationUpdated(updated, { user });
    } catch (error) {
      console.error('Error updating quotation:', error);
    }
  };

  const handleEditUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
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
    notificationManager.notifyUserCreated(userWithId, { user });
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
    loading,
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
    refreshData: loadData,
  };
};