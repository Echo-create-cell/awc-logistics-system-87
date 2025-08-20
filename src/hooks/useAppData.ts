import { useState } from 'react';
import { Quotation, User } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { useOverdueNotifications } from '@/components/hooks/useOverdueNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseQuotations } from '@/hooks/useSupabaseQuotations';
import { useSupabaseInvoices } from '@/hooks/useSupabaseInvoices';
import { useSupabaseUsers } from '@/hooks/useSupabaseUsers';

export const useAppData = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Use Supabase hooks for data management
  const { 
    quotations, 
    loading: quotationsLoading, 
    createQuotation, 
    updateQuotation 
  } = useSupabaseQuotations();
  
  const { 
    invoices, 
    loading: invoicesLoading, 
    createInvoice, 
    updateInvoice 
  } = useSupabaseInvoices();
  
  const { 
    users, 
    loading: usersLoading, 
    createUser, 
    updateUser, 
    deleteUser 
  } = useSupabaseUsers();
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
    
    try {
      await updateQuotation(id, {
        status: 'won' as const,
        approvedBy: user.name,
        approvedAt: new Date().toISOString()
      });
      
      notifyQuotationApproved(quotation, { user });
      notificationManager.notifyQuotationApproved(quotation, { user });
    } catch (error) {
      console.error('Failed to approve quotation:', error);
    }
  };

  const handleRejectQuotation = async (id: string, reason: string, saveAsDraft = false) => {
    const quotation = quotations.find(q => q.id === id);
    if (!quotation) return;
    
    try {
      if (saveAsDraft) {
        // Save as draft - return to original agent for modification
        const draftRemarks = [quotation.remarks, `Draft Rejection Feedback: ${reason}`].filter(Boolean).join('\n\n');
        await updateQuotation(id, {
          status: 'pending' as const,
          remarks: draftRemarks
        });
        
        // Notify the agent about the feedback
        notifyQuotationFeedback(quotation, reason, { user });
      } else {
        // Permanent rejection
        const newRemarks = [quotation.remarks, `Reason for loss: ${reason}`].filter(Boolean).join('\n\n');
        await updateQuotation(id, {
          status: 'lost' as const,
          remarks: newRemarks
        });
        
        notifyQuotationRejected(quotation, reason, { user });
        notificationManager.notifyQuotationRejected(quotation, reason, { user });
      }
    } catch (error) {
      console.error('Failed to reject quotation:', error);
    }
  };

  const handleQuotationCreated = async (newQuotationData: Quotation) => {
    try {
      await createQuotation(newQuotationData);
      notifyQuotationCreated(newQuotationData, { user });
      notificationManager.notifyQuotationCreated(newQuotationData, { user });
      setActiveTab('quotations');
    } catch (error) {
      console.error('Failed to create quotation:', error);
    }
  };

  const handleGenerateInvoiceFromQuotation = (quotation: Quotation) => {
    setInvoiceQuotation(quotation);
    setActiveTab('invoices');
    // Notification will be sent when invoice is actually created
  };

  const handleSaveInvoice = async (invoice: InvoiceData) => {
    try {
      await createInvoice(invoice);

      if (invoice.quotationId) {
        const quotation = quotations.find(q => q.id === invoice.quotationId);
        
        if (quotation) {
          notifyInvoiceGenerated(quotation, invoice, { user });
        }
      } else {
        notifyInvoiceCreated(invoice, { user });
        notificationManager.notifyInvoiceCreated(invoice, { user });
      }
      
      // Clear the invoice quotation after saving
      setInvoiceQuotation(null);
    } catch (error) {
      console.error('Failed to save invoice:', error);
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

  const handleEditUser = async (updatedUser: User) => {
    try {
      await updateUser(updatedUser.id, updatedUser);
      notifyUserUpdated(updatedUser, { user });
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    try {
      await deleteUser(userId);
      if (userToDelete) {
        notifyUserDeleted(userToDelete.name, { user });
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleCreateUser = async (newUser: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const createdUser = await createUser(newUser);
      const userWithTimestamp = {
        ...createdUser,
        createdAt: new Date().toISOString(),
      } as User;
      
      notifyUserCreated(userWithTimestamp, { user });
      notificationManager.notifyUserCreated(userWithTimestamp, { user });
    } catch (error) {
      console.error('Failed to create user:', error);
    }
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
    loading: quotationsLoading || invoicesLoading || usersLoading,
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
  };
};
