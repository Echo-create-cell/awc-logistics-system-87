import { useToast } from '@/hooks/use-toast';
import { Quotation, User } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { NOTIFICATIONS_ENABLED } from '@/config/features';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';


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

  // Helper function to send email notifications
  const sendEmailNotification = async (
    userId: string, 
    title: string, 
    description: string, 
    variant: "default" | "destructive" | "success" | "warning" = "default",
    priority: "low" | "medium" | "high" | "critical" = "medium"
  ) => {
    try {
      await supabase.functions.invoke('send-notification-email', {
        body: {
          userId,
          title,
          description,
          variant,
          priority
        }
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  };

  // Helper function to get all user IDs for system-wide notifications
  const getAllUserIds = async (): Promise<string[]> => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('status', 'active');
      
      return profiles?.map(p => p.user_id) || [];
    } catch (error) {
      console.error('Failed to get user IDs:', error);
      return [];
    }
  };

  // Helper function to send notification to relevant users
  const notifyRelevantUsers = async (
    title: string, 
    description: string, 
    variant: "default" | "destructive" | "success" | "warning" = "default",
    priority: "low" | "medium" | "high" | "critical" = "medium",
    targetUsers?: string[]
  ) => {
    try {
      let userIds = targetUsers;
      
      // If no specific users provided, notify all active users
      if (!userIds) {
        userIds = await getAllUserIds();
      }

      // Send email to all relevant users
      for (const userId of userIds) {
        await sendEmailNotification(userId, title, description, variant, priority);
      }
    } catch (error) {
      console.error('Failed to send notifications to users:', error);
    }
  };

  // Quotation Notifications
  const notifyQuotationCreated = (quotation: Quotation, context?: NotificationContext) => {
    const title = "✅ Quotation Created";
    const description = `Quotation Q-${quotation.id.slice(-4)} for ${quotation.clientName} has been successfully created and is pending approval.`;
    
    toast({
      title,
      description,
      variant: "default",
    });
    
    // Send email to all users
    notifyRelevantUsers(title, description, "default", "medium");
  };

  const notifyQuotationUpdated = (quotation: Quotation, context?: NotificationContext) => {
    const title = "📝 Quotation Updated";
    const description = `Quotation Q-${quotation.id.slice(-4)} for ${quotation.clientName} has been successfully updated.`;
    
    toast({
      title,
      description,
      variant: "default",
    });
    
    // Send email to all users
    notifyRelevantUsers(title, description, "default", "medium");
  };

  const notifyQuotationApproved = (quotation: Quotation, context?: NotificationContext) => {
    const title = "🎉 Quotation Approved";
    const description = `Quotation Q-${quotation.id.slice(-4)} for ${quotation.clientName} has been approved${context?.user ? ` by ${context.user.name}` : ''}. Ready for invoice generation.`;
    
    toast({
      title,
      description,
      variant: "default",
    });
    
    // Send email to all users
    notifyRelevantUsers(title, description, "success", "high");
  };

  const notifyQuotationRejected = (quotation: Quotation, reason: string, context?: NotificationContext) => {
    const title = "❌ Quotation Rejected";
    const description = `Quotation Q-${quotation.id.slice(-4)} for ${quotation.clientName} has been rejected. Reason: ${reason}`;
    
    toast({
      title,
      description,
      variant: "destructive",
    });
    
    // Send email to all users
    notifyRelevantUsers(title, description, "destructive", "high");
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
    
    const title = `${statusEmojis[newStatus as keyof typeof statusEmojis] || "🔄"} Status Updated`;
    const description = `Quotation Q-${quotation.id.slice(-4)} status changed from ${oldStatus} to ${newStatus}.`;
    const variant = newStatus === 'lost' ? "destructive" : "default";
    
    toast({
      title,
      description,
      variant,
    });
    
    // Send email to all users
    notifyRelevantUsers(title, description, variant, newStatus === 'won' ? "high" : "medium");
  };

  // Invoice Notifications
  const notifyInvoiceCreated = (invoice: InvoiceData, context?: NotificationContext) => {
    const title = "💰 Invoice Created";
    const description = `Invoice ${invoice.invoiceNumber} has been successfully created${invoice.quotationId ? ` from quotation Q-${invoice.quotationId.slice(-4)}` : ''}.`;
    
    toast({
      title,
      description,
      variant: "default",
    });
    
    // Send email to all users
    notifyRelevantUsers(title, description, "success", "medium");
  };

  const notifyInvoiceUpdated = (invoice: InvoiceData, context?: NotificationContext) => {
    const title = "💰 Invoice Updated";
    const description = `Invoice ${invoice.invoiceNumber} has been successfully updated.`;
    
    toast({
      title,
      description,
      variant: "default",
    });
    
    // Send email to all users
    notifyRelevantUsers(title, description, "default", "medium");
  };

  const notifyInvoiceGenerated = (quotation: Quotation, invoice: InvoiceData, context?: NotificationContext) => {
    const title = "🧾 Invoice Generated";
    const description = `Invoice ${invoice.invoiceNumber} has been generated from quotation Q-${quotation.id.slice(-4)} for ${quotation.clientName}.`;
    
    toast({
      title,
      description,
      variant: "default",
    });
    
    // Send email to all users
    notifyRelevantUsers(title, description, "success", "high");
  };

  const notifyInvoicePrinted = (invoice: InvoiceData, context?: NotificationContext) => {
    const title = "🖨️ Invoice Prepared for Print";
    const description = `Invoice ${invoice.invoiceNumber} is ready for printing.`;
    
    toast({
      title,
      description,
      variant: "default",
    });
    
    // Send email to all users
    notifyRelevantUsers(title, description, "default", "low");
  };

  // User Management Notifications
  const notifyUserCreated = (user: User, context?: NotificationContext) => {
    const title = "👤 User Created";
    const description = `User ${user.name} (${user.role}) has been successfully created and added to the system.`;
    
    toast({
      title,
      description,
      variant: "default",
    });
    
    // Send email to all users
    notifyRelevantUsers(title, description, "success", "medium");
  };

  const notifyUserUpdated = (user: User, context?: NotificationContext) => {
    const title = "👤 User Updated";
    const description = `User profile for ${user.name} has been successfully updated.`;
    
    toast({
      title,
      description,
      variant: "default",
    });
    
    // Send email to all users
    notifyRelevantUsers(title, description, "default", "low");
  };

  const notifyUserDeleted = (userName: string, context?: NotificationContext) => {
    const title = "🗑️ User Deleted";
    const description = `User ${userName} has been permanently removed from the system.`;
    
    toast({
      title,
      description,
      variant: "destructive",
    });
    
    // Send email to all users
    notifyRelevantUsers(title, description, "destructive", "high");
  };

  const notifyPasswordReset = (userName: string, newPassword: string, context?: NotificationContext) => {
    const title = "🔑 Password Reset";
    const description = `Password for ${userName} has been reset. New password: ${newPassword}`;
    
    toast({
      title,
      description,
      variant: "success",
      duration: 10000, // Longer duration for password info
    });
  };

  const notifyError = (message: string, context?: NotificationContext) => {
    const title = "❌ Error";
    
    toast({
      title,
      description: message,
      variant: "destructive",
    });
  };

  const notifyUserRoleChanged = (user: User, oldRole: string, newRole: string, context?: NotificationContext) => {
    const title = "🔑 Role Updated";
    const description = `${user.name}'s role has been changed from ${oldRole} to ${newRole}.`;
    
    toast({
      title,
      description,
      variant: "default",
    });
    
    // Send email to all users
    notifyRelevantUsers(title, description, "default", "high");
  };

  // System Operations Notifications
  const notifySystemBackup = (success: boolean, backupType: string, context?: NotificationContext) => {
    const title = success ? "💾 Backup Completed" : "⚠️ Backup Failed";
    const description = success 
      ? `${backupType} backup has been successfully completed.`
      : `${backupType} backup failed. Please check system status.`;
    const variant = success ? "default" : "destructive";
    
    toast({
      title,
      description,
      variant,
    });
    
    // Send email to all users
    notifyRelevantUsers(title, description, variant, success ? "medium" : "critical");
  };

  const notifyDataReset = (context?: NotificationContext) => {
    const title = "🔄 System Reset";
    const description = "All system data has been reset. Storage space optimized.";
    
    toast({
      title,
      description,
      variant: "destructive",
    });
    
    // Send email to all users
    notifyRelevantUsers(title, description, "destructive", "critical");
  };

  const notifySystemMaintenance = (message: string, context?: NotificationContext) => {
    const title = "🔧 System Maintenance";
    
    toast({
      title,
      description: message,
      variant: "default",
    });
    
    // Send email to all users
    notifyRelevantUsers(title, message, "warning", "high");
  };

  // Authentication Notifications
  const notifyLoginSuccess = (user: User, context?: NotificationContext) => {
    const title = "🔓 Login Successful";
    const description = `Welcome back, ${user.name}! You are now logged in as ${user.role}.`;
    
    toast({
      title,
      description,
      variant: "default",
    });
    
    // Send email to specific user
    if (user?.id) {
      sendEmailNotification(user.id, title, description, "success", "low");
    }
  };

  const notifyLoginFailed = (reason: string, context?: NotificationContext) => {
    const title = "🔒 Login Failed";
    const description = reason || "Invalid credentials. Please check your email and password.";
    
    toast({
      title,
      description,
      variant: "destructive",
    });
    
    // Don't send email for failed login attempts for security reasons
  };

  const notifyLogout = (userName: string, context?: NotificationContext) => {
    const title = "👋 Logged Out";
    const description = `${userName} has been successfully logged out.`;
    
    toast({
      title,
      description,
      variant: "default",
    });
    
    // Don't send email for logout
  };

  // Permission & Access Notifications
  const notifyAccessDenied = (action: string, context?: NotificationContext) => {
    const title = "🚫 Access Denied";
    const description = `You don't have permission to ${action}. Contact your administrator.`;
    
    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  const notifyUnauthorizedAccess = (resource: string, context?: NotificationContext) => {
    const title = "⚠️ Unauthorized Access";
    const description = `Unauthorized attempt to access ${resource}. This incident has been logged.`;
    
    toast({
      title,
      description,
      variant: "destructive",
    });
    
    // Send email to all users for security alerts
    notifyRelevantUsers(title, description, "destructive", "critical");
  };

  // Data Operations Notifications
  const notifyDataExported = (dataType: string, format: string, context?: NotificationContext) => {
    const title = "📤 Export Completed";
    const description = `${dataType} data has been successfully exported to ${format} format.`;
    
    toast({
      title,
      description,
      variant: "default",
    });
  };

  const notifyDataImported = (dataType: string, recordCount: number, context?: NotificationContext) => {
    const title = "📥 Import Completed";
    const description = `Successfully imported ${recordCount} ${dataType} records.`;
    
    toast({
      title,
      description,
      variant: "default",
    });
  };

  // Network & Connectivity Notifications
  const notifyConnectionIssue = (context?: NotificationContext) => {
    const title = "🌐 Connection Issue";
    const description = "Network connectivity issues detected. Some features may be limited.";
    
    toast({
      title,
      description,
      variant: "destructive",
    });
    
    // Send email to all users for system-wide issues
    notifyRelevantUsers(title, description, "destructive", "high");
  };

  const notifyConnectionRestored = (context?: NotificationContext) => {
    const title = "🌐 Connection Restored";
    const description = "Network connectivity has been restored. All features are now available.";
    
    toast({
      title,
      description,
      variant: "default",
    });
    
    // Send email to all users
    notifyRelevantUsers(title, description, "success", "medium");
  };

  // Validation & Error Notifications
  const notifyValidationError = (field: string, message: string, context?: NotificationContext) => {
    const title = "⚠️ Validation Error";
    const description = `${field}: ${message}`;
    
    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  const notifyFormSaved = (formType: string, context?: NotificationContext) => {
    const title = "💾 Form Saved";
    const description = `${formType} form has been successfully saved.`;
    
    toast({
      title,
      description,
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