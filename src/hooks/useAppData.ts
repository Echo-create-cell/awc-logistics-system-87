import { useState } from 'react';
import { Quotation, User } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { mockUsers } from '@/data/mockData';
import { useSupabaseQuotations } from '@/hooks/useSupabaseQuotations';
import { useSupabaseInvoices } from '@/hooks/useSupabaseInvoices';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { useOverdueNotifications } from '@/components/hooks/useOverdueNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAppData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [quotationFilter, setQuotationFilter] = useState<'overdue' | 'pending' | 'all'>('all');
  const [invoiceFilter, setInvoiceFilter] = useState<'overdue' | 'pending' | 'all'>('all');
  
  // Use Supabase hooks for permanent storage
  const { 
    quotations, 
    createQuotation, 
    updateQuotation,
    refetch: refetchQuotations 
  } = useSupabaseQuotations();
  
  const { 
    invoices, 
    createInvoice, 
    updateInvoice,
    refetch: refetchInvoices 
  } = useSupabaseInvoices();
  const [printPreview, setPrintPreview] = useState<InvoiceData | null>(null);
  const [invoiceQuotation, setInvoiceQuotation] = useState<Quotation | null>(null);
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

  const handleApproveQuotation = async (id: string) => {
    if (!user) return;
    const quotation = quotations.find(q => q.id === id);
    if (!quotation) return;
    
    await updateQuotation(id, { 
      status: 'won' as const, 
      approvedBy: user.name, 
      approvedAt: new Date().toISOString() 
    });
    
    // Multiple notification systems for comprehensive coverage
    notifyQuotationApproved(quotation, { user });
    notificationManager.notifyQuotationApproved(quotation, { user });
  };

  const handleRejectQuotation = async (id: string, reason: string, saveAsDraft = false) => {
    const quotation = quotations.find(q => q.id === id);
    if (!quotation) return;
    
    if (saveAsDraft) {
      // Save as draft - return to original agent for modification
      const draftRemarks = [quotation.remarks, `Draft Rejection Feedback: ${reason}`].filter(Boolean).join('\n\n');
      await updateQuotation(id, { status: 'pending' as const, remarks: draftRemarks });
      
      // Notify the agent about the feedback
      notifyQuotationFeedback(quotation, reason, { user });
    } else {
      // Permanent rejection
      const newRemarks = [quotation.remarks, `Reason for loss: ${reason}`].filter(Boolean).join('\n\n');
      await updateQuotation(id, { status: 'lost' as const, remarks: newRemarks });
      
      notifyQuotationRejected(quotation, reason, { user });
      notificationManager.notifyQuotationRejected(quotation, reason, { user });
    }
  };

  const handleQuotationCreated = async (newQuotationData: Quotation) => {
    try {
      console.log('Creating quotation with data:', newQuotationData);
      console.log('User context:', user);
      
      const result = await createQuotation(newQuotationData);
      console.log('Quotation created successfully:', result);
      
      // Multiple notification systems for comprehensive coverage
      notifyQuotationCreated(newQuotationData, { user });
      notificationManager.notifyQuotationCreated(newQuotationData, { user });
      setActiveTab('quotations');
    } catch (error) {
      console.error('Failed to create quotation - detailed error:', error);
      throw error; // Re-throw to let the UI handle it
    }
  };

  const handleGenerateInvoiceFromQuotation = (quotation: Quotation) => {
    // Check if an invoice already exists for this quotation
    if (quotation.linkedInvoiceIds && quotation.linkedInvoiceIds.length > 0) {
      toast({
        variant: "destructive",
        title: "Invoice Already Generated",
        description: "An invoice has already been generated for this quotation.",
      });
      return;
    }
    
    setInvoiceQuotation(quotation);
    setActiveTab('invoices');
    // Notification will be sent when invoice is actually created
  };

  const handleSaveInvoice = async (invoice: InvoiceData) => {
    try {
      // Check if an invoice already exists for this quotation
      if (invoice.quotationId) {
        const quotation = quotations.find(q => q.id === invoice.quotationId);
        if (quotation?.linkedInvoiceIds && quotation.linkedInvoiceIds.length > 0) {
          throw new Error('An invoice has already been generated for this quotation');
        }
      }

      await createInvoice(invoice);

      if (invoice.quotationId) {
        const quotation = quotations.find(q => q.id === invoice.quotationId);
        
        if (quotation) {
          notifyInvoiceGenerated(quotation, invoice, { user });
        }
        
        // Refresh quotations to update linkedInvoiceIds
        await refetchQuotations();
      } else {
        notifyInvoiceCreated(invoice, { user });
        notificationManager.notifyInvoiceCreated(invoice, { user });
      }
      
      // Clear the invoice quotation after saving
      setInvoiceQuotation(null);
    } catch (error) {
      console.error('Failed to save invoice:', error);
      // Re-throw to let the UI handle the error display
      throw error;
    }
  };

  const handleEditInvoice = async (updatedInvoice: InvoiceData) => {
    try {
      await updateInvoice(updatedInvoice.id, updatedInvoice);
      notifyInvoiceUpdated(updatedInvoice, { user });
    } catch (error) {
      console.error('Failed to update invoice:', error);
    }
  };

  const handlePrintInvoice = (invoice: InvoiceData) => {
    setPrintPreview(invoice);
    notifyInvoicePrinted(invoice, { user });
  };

  const handleEditQuotation = async (updatedQuotation: Quotation) => {
    try {
      await updateQuotation(updatedQuotation.id, updatedQuotation);
      notifyQuotationUpdated(updatedQuotation, { user });
    } catch (error) {
      console.error('Failed to update quotation:', error);
    }
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
    notificationManager.notifyUserCreated(userWithId, { user });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'invoices') {
      setInvoiceQuotation(null);
    }
    // Reset filters when changing tabs
    if (tab !== 'quotations') {
      setQuotationFilter('all');
    }
    if (tab !== 'invoices') {
      setInvoiceFilter('all');
    }
  };

  // Navigation functions for notifications
  const navigateToQuotations = (filter: 'overdue' | 'pending' | 'all' = 'all') => {
    setQuotationFilter(filter);
    setActiveTab('quotations');
  };

  const navigateToInvoices = (filter: 'overdue' | 'pending' | 'all' = 'all') => {
    setInvoiceFilter(filter);
    setActiveTab('invoices');
  };

  return {
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
  };
};
