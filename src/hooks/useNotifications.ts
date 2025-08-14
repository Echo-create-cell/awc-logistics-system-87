import { useToast } from '@/hooks/use-toast';
import { Quotation, User } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { NOTIFICATIONS_ENABLED } from '@/config/features';


export interface NotificationContext {
  user?: User;
  timestamp?: string;
  additionalInfo?: Record<string, any>;
}

export const useNotifications = () => {
  if (!NOTIFICATIONS_ENABLED) {
    const noop = (..._args: any[]) => undefined as any;
    return {
      // Quotation notifications
      notifyQuotationCreated: noop,
      notifyQuotationUpdated: noop,
      notifyQuotationApproved: noop,
      notifyQuotationRejected: noop,
      notifyQuotationStatusChanged: noop,
      // Invoice notifications
      notifyInvoiceCreated: noop,
      notifyInvoiceUpdated: noop,
      notifyInvoiceGenerated: noop,
      notifyInvoicePrinted: noop,
      // User management notifications
      notifyUserCreated: noop,
      notifyUserUpdated: noop,
      notifyUserDeleted: noop,
      notifyUserRoleChanged: noop,
      // System operations notifications
      notifySystemBackup: noop,
      notifyDataReset: noop,
      notifySystemMaintenance: noop,
      // Authentication notifications
      notifyLoginSuccess: noop,
      notifyLoginFailed: noop,
      notifyLogout: noop,
      // Permission notifications
      notifyAccessDenied: noop,
      notifyUnauthorizedAccess: noop,
      // Data operations notifications
      notifyDataExported: noop,
      notifyDataImported: noop,
      // Network notifications
      notifyConnectionIssue: noop,
      notifyConnectionRestored: noop,
      // Validation notifications
      notifyValidationError: noop,
      notifyFormSaved: noop,
      // Password reset and error notifications
      notifyPasswordReset: noop,
      notifyError: noop,
      // Custom notification
      notifyCustom: noop,
    };
  }
  const { toast } = useToast();

  // Quotation Notifications
  const notifyQuotationCreated = (quotation: Quotation, context?: NotificationContext) => {
    toast({
      title: "✅ Quotation Created",
      description: `Quotation Q-${quotation.id.slice(-4)} for ${quotation.clientName} has been successfully created and is pending approval.`,
      variant: "default",
    });
  };

  const notifyQuotationUpdated = (quotation: Quotation, context?: NotificationContext) => {
    toast({
      title: "📝 Quotation Updated",
      description: `Quotation Q-${quotation.id.slice(-4)} for ${quotation.clientName} has been successfully updated.`,
      variant: "default",
    });
  };

  const notifyQuotationApproved = (quotation: Quotation, context?: NotificationContext) => {
    toast({
      title: "🎉 Quotation Approved",
      description: `Quotation Q-${quotation.id.slice(-4)} for ${quotation.clientName} has been approved${context?.user ? ` by ${context.user.name}` : ''}. Ready for invoice generation.`,
      variant: "default",
    });
  };

  const notifyQuotationRejected = (quotation: Quotation, reason: string, context?: NotificationContext) => {
    toast({
      title: "❌ Quotation Rejected",
      description: `Quotation Q-${quotation.id.slice(-4)} for ${quotation.clientName} has been rejected. Reason: ${reason}`,
      variant: "destructive",
    });
  };

  const notifyQuotationFeedback = (quotation: Quotation, feedback: string, context?: NotificationContext) => {
    toast({
      title: "📝 Quotation Feedback",
      description: `Quotation Q-${quotation.id.slice(-4)} for ${quotation.clientName} requires revision. Admin feedback: ${feedback}`,
      variant: "default",
    });
  };

  const notifyQuotationStatusChanged = (quotation: Quotation, oldStatus: string, newStatus: string, context?: NotificationContext) => {
    const statusEmojis = {
      pending: "⏳",
      won: "🏆",
      lost: "❌",
      draft: "📝"
    };
    
    toast({
      title: `${statusEmojis[newStatus as keyof typeof statusEmojis] || "🔄"} Status Updated`,
      description: `Quotation Q-${quotation.id.slice(-4)} status changed from ${oldStatus} to ${newStatus}.`,
      variant: newStatus === 'lost' ? "destructive" : "default",
    });
  };

  // Invoice Notifications
  const notifyInvoiceCreated = (invoice: InvoiceData, context?: NotificationContext) => {
    toast({
      title: "💰 Invoice Created",
      description: `Invoice ${invoice.invoiceNumber} has been successfully created${invoice.quotationId ? ` from quotation Q-${invoice.quotationId.slice(-4)}` : ''}.`,
      variant: "default",
    });
  };

  const notifyInvoiceUpdated = (invoice: InvoiceData, context?: NotificationContext) => {
    toast({
      title: "💰 Invoice Updated",
      description: `Invoice ${invoice.invoiceNumber} has been successfully updated.`,
      variant: "default",
    });
  };

  const notifyInvoiceGenerated = (quotation: Quotation, invoice: InvoiceData, context?: NotificationContext) => {
    toast({
      title: "🧾 Invoice Generated",
      description: `Invoice ${invoice.invoiceNumber} has been generated from quotation Q-${quotation.id.slice(-4)} for ${quotation.clientName}.`,
      variant: "default",
    });
  };

  const notifyInvoicePrinted = (invoice: InvoiceData, context?: NotificationContext) => {
    toast({
      title: "🖨️ Invoice Prepared for Print",
      description: `Invoice ${invoice.invoiceNumber} is ready for printing.`,
      variant: "default",
    });
  };

  // User Management Notifications
  const notifyUserCreated = (user: User, context?: NotificationContext) => {
    toast({
      title: "👤 User Created",
      description: `User ${user.name} (${user.role}) has been successfully created and added to the system.`,
      variant: "default",
    });
  };

  const notifyUserUpdated = (user: User, context?: NotificationContext) => {
    toast({
      title: "👤 User Updated",
      description: `User profile for ${user.name} has been successfully updated.`,
      variant: "default",
    });
  };

  const notifyUserDeleted = (userName: string, context?: NotificationContext) => {
    toast({
      title: "🗑️ User Deleted",
      description: `User ${userName} has been permanently removed from the system.`,
      variant: "destructive",
    });
  };

  const notifyPasswordReset = (userName: string, newPassword: string, context?: NotificationContext) => {
    toast({
      title: "🔑 Password Reset",
      description: `Password for ${userName} has been reset. New password: ${newPassword}`,
      variant: "success",
      duration: 10000, // Longer duration for password info
    });
  };

  const notifyError = (message: string, context?: NotificationContext) => {
    toast({
      title: "❌ Error",
      description: message,
      variant: "destructive",
    });
  };

  const notifyUserRoleChanged = (user: User, oldRole: string, newRole: string, context?: NotificationContext) => {
    toast({
      title: "🔑 Role Updated",
      description: `${user.name}'s role has been changed from ${oldRole} to ${newRole}.`,
      variant: "default",
    });
  };

  // System Operations Notifications
  const notifySystemBackup = (success: boolean, backupType: string, context?: NotificationContext) => {
    toast({
      title: success ? "💾 Backup Completed" : "⚠️ Backup Failed",
      description: success 
        ? `${backupType} backup has been successfully completed.`
        : `${backupType} backup failed. Please check system status.`,
      variant: success ? "default" : "destructive",
    });
  };

  const notifyDataReset = (context?: NotificationContext) => {
    toast({
      title: "🔄 System Reset",
      description: "All system data has been reset. Storage space optimized.",
      variant: "destructive",
    });
  };

  const notifySystemMaintenance = (message: string, context?: NotificationContext) => {
    toast({
      title: "🔧 System Maintenance",
      description: message,
      variant: "default",
    });
  };

  // Authentication Notifications
  const notifyLoginSuccess = (user: User, context?: NotificationContext) => {
    toast({
      title: "🔓 Login Successful",
      description: `Welcome back, ${user.name}! You are now logged in as ${user.role}.`,
      variant: "default",
    });
  };

  const notifyLoginFailed = (reason: string, context?: NotificationContext) => {
    toast({
      title: "🔒 Login Failed",
      description: reason || "Invalid credentials. Please check your email and password.",
      variant: "destructive",
    });
  };

  const notifyLogout = (userName: string, context?: NotificationContext) => {
    toast({
      title: "👋 Logged Out",
      description: `${userName} has been successfully logged out.`,
      variant: "default",
    });
  };

  // Permission & Access Notifications
  const notifyAccessDenied = (action: string, context?: NotificationContext) => {
    toast({
      title: "🚫 Access Denied",
      description: `You don't have permission to ${action}. Contact your administrator.`,
      variant: "destructive",
    });
  };

  const notifyUnauthorizedAccess = (resource: string, context?: NotificationContext) => {
    toast({
      title: "⚠️ Unauthorized Access",
      description: `Unauthorized attempt to access ${resource}. This incident has been logged.`,
      variant: "destructive",
    });
  };

  // Data Operations Notifications
  const notifyDataExported = (dataType: string, format: string, context?: NotificationContext) => {
    toast({
      title: "📤 Export Completed",
      description: `${dataType} data has been successfully exported to ${format} format.`,
      variant: "default",
    });
  };

  const notifyDataImported = (dataType: string, recordCount: number, context?: NotificationContext) => {
    toast({
      title: "📥 Import Completed",
      description: `Successfully imported ${recordCount} ${dataType} records.`,
      variant: "default",
    });
  };

  // Network & Connectivity Notifications
  const notifyConnectionIssue = (context?: NotificationContext) => {
    toast({
      title: "🌐 Connection Issue",
      description: "Network connectivity issues detected. Some features may be limited.",
      variant: "destructive",
    });
  };

  const notifyConnectionRestored = (context?: NotificationContext) => {
    toast({
      title: "🌐 Connection Restored",
      description: "Network connectivity has been restored. All features are now available.",
      variant: "default",
    });
  };

  // Validation & Error Notifications
  const notifyValidationError = (field: string, message: string, context?: NotificationContext) => {
    toast({
      title: "⚠️ Validation Error",
      description: `${field}: ${message}`,
      variant: "destructive",
    });
  };

  const notifyFormSaved = (formType: string, context?: NotificationContext) => {
    toast({
      title: "💾 Form Saved",
      description: `${formType} form has been successfully saved.`,
      variant: "default",
    });
  };

  // Custom notification for any operation
  const notifyCustom = (title: string, description: string, variant: "default" | "destructive" = "default", context?: NotificationContext) => {
    toast({
      title,
      description,
      variant,
    });
  };

  return {
    // Quotation notifications
    notifyQuotationCreated,
    notifyQuotationUpdated,
    notifyQuotationApproved,
    notifyQuotationRejected,
    notifyQuotationFeedback,
    notifyQuotationStatusChanged,
    
    // Invoice notifications
    notifyInvoiceCreated,
    notifyInvoiceUpdated,
    notifyInvoiceGenerated,
    notifyInvoicePrinted,
    
    // User management notifications
    notifyUserCreated,
    notifyUserUpdated,
    notifyUserDeleted,
    notifyUserRoleChanged,
    
    // System operations notifications
    notifySystemBackup,
    notifyDataReset,
    notifySystemMaintenance,
    
    // Authentication notifications
    notifyLoginSuccess,
    notifyLoginFailed,
    notifyLogout,
    
    // Permission notifications
    notifyAccessDenied,
    notifyUnauthorizedAccess,
    
    // Data operations notifications
    notifyDataExported,
    notifyDataImported,
    
    // Network notifications
    notifyConnectionIssue,
    notifyConnectionRestored,
    
    // Validation notifications
    notifyValidationError,
    notifyFormSaved,
    
    // Password reset and error notifications
    notifyPasswordReset,
    notifyError,
    
    // Custom notification
    notifyCustom,
  };
};