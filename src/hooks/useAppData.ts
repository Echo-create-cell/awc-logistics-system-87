import { useState } from 'react';
import { Quotation, User } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { mockQuotations, mockUsers } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const mockInvoices: InvoiceData[] = [];

export const useAppData = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [invoices, setInvoices] = useState<InvoiceData[]>(mockInvoices);
  const [printPreview, setPrintPreview] = useState<InvoiceData | null>(null);
  const [invoiceQuotation, setInvoiceQuotation] = useState<Quotation | null>(null);
  const { toast } = useToast();

  const handleApproveQuotation = (id: string) => {
    if (!user) return;
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

  const handleRejectQuotation = (id: string, reason: string) => {
    setQuotations(prev =>
      prev.map(q => {
        if (q.id === id) {
          const newRemarks = [q.remarks, `Reason for loss: ${reason}`].filter(Boolean).join('\n\n');
          return { ...q, status: 'lost' as const, remarks: newRemarks };
        }
        return q;
      })
    );
    toast({
      title: "Quotation Rejected",
      description: "The quotation has been marked as lost.",
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

  const handleGenerateInvoiceFromQuotation = (quotation: Quotation) => {
    setInvoiceQuotation(quotation);
    setActiveTab('invoices');
  };

  const handleSaveInvoice = (invoice: InvoiceData) => {
    setInvoices(prev => [invoice, ...prev]);

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
    
    // Clear the invoice quotation after saving
    setInvoiceQuotation(null);
    
    toast({
      title: "Invoice Saved",
      description: `Invoice ${invoice.invoiceNumber} has been created successfully.`,
    });
  };

  const handleEditInvoice = (updatedInvoice: InvoiceData) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    ));
    toast({
      title: "Invoice Updated",
      description: `Invoice ${updatedInvoice.invoiceNumber} has been updated successfully.`,
    });
  };

  const handlePrintInvoice = (invoice: InvoiceData) => {
    setPrintPreview(invoice);
  };

  const handleEditQuotation = (updatedQuotation: Quotation) => {
    setQuotations(prev => prev.map(q => 
      q.id === updatedQuotation.id ? updatedQuotation : q
    ));
    toast({
      title: "Quotation Updated",
      description: `Quotation for ${updatedQuotation.clientName} has been updated successfully.`,
    });
  };

  const handleEditUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    ));
    toast({
      title: "User Updated",
      description: `User ${updatedUser.name} has been updated successfully.`,
    });
  };
  
  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast({
      title: "User Deleted",
      description: "User has been successfully deleted.",
      variant: "destructive",
    });
  };

  const handleCreateUser = (newUser: Omit<User, 'id' | 'createdAt'>) => {
    const userWithId: User = {
      ...newUser,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    } as User;
    setUsers(prev => [userWithId, ...prev]);
    toast({
      title: "User Created",
      description: `User ${userWithId.name} has been created successfully.`,
    });
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
