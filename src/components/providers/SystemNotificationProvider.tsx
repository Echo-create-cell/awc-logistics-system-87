import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { showPersistentToast } from '@/components/ui/persistent-toast';
import { Quotation, User } from '@/types';
import { InvoiceData } from '@/types/invoice';

interface SystemNotificationContextProps {
  notifySystemEvent: (
    title: string,
    description: string,
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info',
    persistent?: boolean
  ) => void;
  notifyQuotationFlow: (quotation: Quotation, action: string, details?: string) => void;
  notifyInvoiceFlow: (invoice: InvoiceData, action: string, details?: string) => void;
  notifyUserFlow: (userData: User | string, action: string, details?: string) => void;
  notifySystemFlow: (module: string, action: string, details: string, priority?: 'low' | 'medium' | 'high' | 'critical') => void;
}

const SystemNotificationContext = createContext<SystemNotificationContextProps | undefined>(undefined);

export const useSystemNotificationContext = () => {
  const context = useContext(SystemNotificationContext);
  if (!context) {
    throw new Error('useSystemNotificationContext must be used within SystemNotificationProvider');
  }
  return context;
};

interface SystemNotificationProviderProps {
  children: React.ReactNode;
  quotations?: Quotation[];
  invoices?: InvoiceData[];
  users?: User[];
}

export const SystemNotificationProvider: React.FC<SystemNotificationProviderProps> = ({
  children,
  quotations = [],
  invoices = [],
  users = []
}) => {
  const { user } = useAuth();
  const notificationManager = useNotificationManager();

  // System-wide persistent notification function
  const notifySystemEvent = (
    title: string,
    description: string,
    variant: 'default' | 'success' | 'error' | 'warning' | 'info' = 'default',
    persistent: boolean = true
  ) => {
    showPersistentToast({
      title,
      description,
      variant,
      persistent,
      priority: 'medium',
      onAction: () => {
        // Could navigate to relevant section or show more details
        console.log('System event details:', { title, description });
      }
    });
  };

  // Quotation flow notifications
  const notifyQuotationFlow = (quotation: Quotation, action: string, details?: string) => {
    const baseTitle = `Quotation ${action}`;
    const description = `${quotation.clientName} - ${quotation.destination} | ${details || quotation.cargoDescription || 'Processing'}`;
    
    let variant: 'success' | 'warning' | 'info' | 'error' = 'info';
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';

    switch (action.toLowerCase()) {
      case 'created':
        variant = 'success';
        priority = 'medium';
        break;
      case 'approved':
      case 'won':
        variant = 'success';
        priority = 'high';
        break;
      case 'rejected':
      case 'lost':
        variant = 'error';
        priority = 'high';
        break;
      case 'updated':
        variant = 'info';
        priority = 'low';
        break;
      case 'overdue':
        variant = 'warning';
        priority = 'critical';
        break;
      default:
        variant = 'info';
    }

    showPersistentToast({
      title: baseTitle,
      description,
      variant,
      persistent: true,
      priority,
      category: 'quotation',
      onAction: () => {
        // Could navigate to quotation details
        console.log('Navigate to quotation:', quotation.id);
      }
    });
  };

  // Invoice flow notifications
  const notifyInvoiceFlow = (invoice: InvoiceData, action: string, details?: string) => {
    const baseTitle = `Invoice ${action}`;
    const description = `${invoice.clientName || 'Unknown Client'} - Invoice #${invoice.invoiceNumber} | ${details || 'Processing'}`;
    
    let variant: 'success' | 'warning' | 'info' | 'error' = 'info';
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';

    switch (action.toLowerCase()) {
      case 'created':
      case 'generated':
        variant = 'success';
        priority = 'medium';
        break;
      case 'paid':
        variant = 'success';
        priority = 'high';
        break;
      case 'overdue':
        variant = 'warning';
        priority = 'critical';
        break;
      case 'printed':
        variant = 'info';
        priority = 'low';
        break;
      case 'updated':
        variant = 'info';
        priority = 'low';
        break;
      default:
        variant = 'info';
    }

    showPersistentToast({
      title: baseTitle,
      description,
      variant,
      persistent: true,
      priority,
      category: 'invoice',
      onAction: () => {
        console.log('Navigate to invoice:', invoice.id);
      }
    });
  };

  // User flow notifications
  const notifyUserFlow = (userData: User | string, action: string, details?: string) => {
    const userName = typeof userData === 'string' ? userData : userData.name;
    const userRole = typeof userData === 'string' ? 'Unknown' : userData.role;
    
    const baseTitle = `User ${action}`;
    const description = `${userName} (${userRole}) | ${details || 'User management action'}`;
    
    let variant: 'success' | 'warning' | 'info' | 'error' = 'info';
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';

    switch (action.toLowerCase()) {
      case 'created':
        variant = 'success';
        priority = 'medium';
        break;
      case 'updated':
        variant = 'info';
        priority = 'low';
        break;
      case 'deleted':
        variant = 'warning';
        priority = 'medium';
        break;
      case 'login':
        variant = 'success';
        priority = 'low';
        break;
      case 'logout':
        variant = 'info';
        priority = 'low';
        break;
      default:
        variant = 'info';
    }

    showPersistentToast({
      title: baseTitle,
      description,
      variant,
      persistent: true,
      priority,
      category: 'user',
      onAction: () => {
        console.log('Navigate to users section');
      }
    });
  };

  // General system flow notifications
  const notifySystemFlow = (
    module: string,
    action: string,
    details: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    const baseTitle = `${module} ${action}`;
    
    let variant: 'success' | 'warning' | 'info' | 'error' = 'info';

    if (action.toLowerCase().includes('error') || action.toLowerCase().includes('failed')) {
      variant = 'error';
      priority = 'critical';
    } else if (action.toLowerCase().includes('warning') || action.toLowerCase().includes('alert')) {
      variant = 'warning';
    } else if (action.toLowerCase().includes('success') || action.toLowerCase().includes('completed')) {
      variant = 'success';
    }

    showPersistentToast({
      title: baseTitle,
      description: details,
      variant,
      persistent: true,
      priority,
      category: 'system',
      onAction: () => {
        console.log('System status check:', { module, action, details });
      }
    });
  };

  // Monitor data changes and trigger notifications
  useEffect(() => {
    if (quotations.length > 0) {
      const pendingCount = quotations.filter(q => q.status === 'pending').length;
      const overdueCount = quotations.filter(q => {
        const created = new Date(q.createdAt);
        const daysSinceCreated = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
        return q.status === 'pending' && daysSinceCreated > 7;
      }).length;

      if (overdueCount > 0) {
        notifySystemFlow(
          'Quotations',
          'Alert',
          `${overdueCount} quotations are overdue and require attention`,
          'critical'
        );
      }
    }
  }, [quotations]);

  useEffect(() => {
    if (invoices.length > 0) {
      const overdueInvoices = invoices.filter(invoice => {
        if (!invoice.dueDate) return false;
        return new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid';
      }).length;

      if (overdueInvoices > 0) {
        notifySystemFlow(
          'Invoices',
          'Payment Alert',
          `${overdueInvoices} invoices are overdue and require follow-up`,
          'critical'
        );
      }
    }
  }, [invoices]);

  const contextValue: SystemNotificationContextProps = {
    notifySystemEvent,
    notifyQuotationFlow,
    notifyInvoiceFlow,
    notifyUserFlow,
    notifySystemFlow,
  };

  return (
    <SystemNotificationContext.Provider value={contextValue}>
      {children}
    </SystemNotificationContext.Provider>
  );
};