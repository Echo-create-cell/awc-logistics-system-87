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
import { useSystemNotificationContext } from '@/components/providers/SystemNotificationProvider';

export const useAppData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>(mockUsers);
  
  // System notification context for enhanced persistent notifications
  const { 
    notifyQuotationFlow, 
    notifyInvoiceFlow, 
    notifyUserFlow, 
    notifySystemFlow 
  } = useSystemNotificationContext();
  
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
    notifyQuotationFlow(quotation, 'approved', `Approved by ${user.name}`);
    notifySystemFlow('Quotations', 'Approved', `Quotation for ${quotation.clientName} has been approved and marked as won`, 'high');
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
      notifyQuotationFlow(quotation, 'feedback received', `Returned for revision: ${reason}`);
      notifySystemFlow('Quotations', 'Feedback', `Quotation for ${quotation.clientName} returned for revision`, 'medium');
    } else {
      // Permanent rejection
      const newRemarks = [quotation.remarks, `Reason for loss: ${reason}`].filter(Boolean).join('\n\n');
      await updateQuotation(id, { status: 'lost' as const, remarks: newRemarks });
      
      notifyQuotationRejected(quotation, reason, { user });
      notificationManager.notifyQuotationRejected(quotation, reason, { user });
      notifyQuotationFlow(quotation, 'rejected', `Rejected: ${reason}`);
      notifySystemFlow('Quotations', 'Rejected', `Quotation for ${quotation.clientName} has been permanently rejected`, 'high');
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
      notifyQuotationFlow(newQuotationData, 'created', `Created by ${user?.name || 'System'}`);
      notifySystemFlow('Quotations', 'Created', `New quotation created for ${newQuotationData.clientName} - ${newQuotationData.destination}`, 'medium');
      setActiveTab('quotations');
    } catch (error) {
      console.error('Failed to create quotation - detailed error:', error);
      notifySystemFlow('Quotations', 'Error', `Failed to create quotation: ${error}`, 'critical');
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
          notifyInvoiceFlow(invoice, 'generated', `Generated from quotation for ${quotation.clientName}`);
        }
        
        // Refresh quotations to update linkedInvoiceIds
        await refetchQuotations();
      } else {
        notifyInvoiceCreated(invoice, { user });
        notificationManager.notifyInvoiceCreated(invoice, { user });
        notifyInvoiceFlow(invoice, 'created', `Created by ${user?.name || 'System'}`);
      }
      
      notifySystemFlow('Invoices', 'Created', `Invoice ${invoice.invoiceNumber} created for ${invoice.clientName}`, 'medium');
      
      // Clear the invoice quotation after saving
      setInvoiceQuotation(null);
    } catch (error) {
      console.error('Failed to save invoice:', error);
      notifySystemFlow('Invoices', 'Error', `Failed to save invoice: ${error}`, 'critical');
      // Re-throw to let the UI handle the error display
      throw error;
    }
  };

  const handleEditInvoice = async (updatedInvoice: InvoiceData) => {
    try {
      await updateInvoice(updatedInvoice.id, updatedInvoice);
      notifyInvoiceUpdated(updatedInvoice, { user });
      notifyInvoiceFlow(updatedInvoice, 'updated', `Updated by ${user?.name || 'System'}`);
      notifySystemFlow('Invoices', 'Updated', `Invoice ${updatedInvoice.invoiceNumber} has been updated`, 'low');
    } catch (error) {
      console.error('Failed to update invoice:', error);
      notifySystemFlow('Invoices', 'Error', `Failed to update invoice: ${error}`, 'critical');
    }
  };

  const handlePrintInvoice = (invoice: InvoiceData) => {
    setPrintPreview(invoice);
    notifyInvoicePrinted(invoice, { user });
    notifyInvoiceFlow(invoice, 'printed', `Print requested by ${user?.name || 'System'}`);
    notifySystemFlow('Invoices', 'Printed', `Invoice ${invoice.invoiceNumber} sent to printer`, 'low');
  };

  const handleEditQuotation = async (updatedQuotation: Quotation) => {
    try {
      await updateQuotation(updatedQuotation.id, updatedQuotation);
      notifyQuotationUpdated(updatedQuotation, { user });
      notifyQuotationFlow(updatedQuotation, 'updated', `Updated by ${user?.name || 'System'}`);
      notifySystemFlow('Quotations', 'Updated', `Quotation for ${updatedQuotation.clientName} has been updated`, 'low');
    } catch (error) {
      console.error('Failed to update quotation:', error);
      notifySystemFlow('Quotations', 'Error', `Failed to update quotation: ${error}`, 'critical');
    }
  };

  const handleEditUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    ));
    notifyUserUpdated(updatedUser, { user });
    notifyUserFlow(updatedUser, 'updated', `Profile updated by ${user?.name || 'System'}`);
    notifySystemFlow('User Management', 'Updated', `User ${updatedUser.name} profile has been updated`, 'low');
  };
  
  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (userToDelete) {
      notifyUserDeleted(userToDelete.name, { user });
      notifyUserFlow(userToDelete, 'deleted', `Deleted by ${user?.name || 'System'}`);
      notifySystemFlow('User Management', 'Deleted', `User ${userToDelete.name} has been removed from the system`, 'medium');
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
    notifyUserFlow(userWithId, 'created', `Created by ${user?.name || 'System'}`);
    notifySystemFlow('User Management', 'Created', `New user ${userWithId.name} has been added to the system`, 'medium');
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
  };
};
