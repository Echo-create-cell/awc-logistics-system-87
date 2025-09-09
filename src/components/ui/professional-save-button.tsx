import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save, CheckCircle, ArrowRight, FileText, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfessionalSaveButtonProps {
  isLoading: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'primary';
  loadingText?: string;
  successText?: string;
  children?: React.ReactNode;
}

export const ProfessionalSaveButton = ({
  isLoading,
  disabled = false,
  onClick,
  className,
  size = 'lg',
  variant = 'primary',
  loadingText = "Saving...",
  successText = "Save",
  children
}: ProfessionalSaveButtonProps) => {
  const baseStyles = {
    default: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500",
    success: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-500",
    primary: "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:ring-purple-500"
  };

  const sizeStyles = {
    sm: "px-4 py-2.5 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles[variant],
        sizeStyles[size],
        "shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-white font-bold relative overflow-hidden",
        "before:absolute before:inset-0 before:bg-white before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-10",
        "focus:outline-none focus:ring-4 focus:ring-opacity-50",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg",
        isLoading && "cursor-not-allowed animate-pulse",
        className
      )}
    >
      <div className="flex items-center justify-center space-x-3 relative z-10">
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span className="tracking-wide">{loadingText}</span>
          </>
        ) : (
          <>
            <Save size={20} className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />
            <span className="tracking-wide">{children || successText}</span>
            <ArrowRight size={16} className="transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
          </>
        )}
      </div>
      
      {/* Enhanced animated background effects */}
      {isLoading && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-pulse" />
        </>
      )}
      
      {/* Success ripple effect */}
      <div className="absolute inset-0 rounded-lg bg-white opacity-0 transition-opacity duration-200 active:opacity-20" />
    </Button>
  );
};

// Enhanced success feedback component with navigation actions
interface SaveSuccessNotificationProps {
  isVisible: boolean;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  onViewInvoices?: () => void;
  onPrintInvoice?: () => void;
  onCreateAnother?: () => void;
  onDismiss?: () => void;
}

export const SaveSuccessNotification = ({
  isVisible,
  invoiceNumber,
  clientName,
  amount,
  currency,
  onViewInvoices,
  onPrintInvoice,
  onCreateAnother,
  onDismiss
}: SaveSuccessNotificationProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-500">
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-xl shadow-2xl p-6 max-w-sm backdrop-blur-sm">
        <div className="space-y-4">
          {/* Success Header */}
          <div className="flex items-start space-x-3">
            <div className="relative">
              <CheckCircle size={28} className="text-green-600" />
              <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping opacity-75"></div>
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-green-900 text-lg">Invoice Created!</h4>
              <div className="text-sm text-green-800 space-y-1">
                <p className="font-semibold">#{invoiceNumber}</p>
                <p>Client: <span className="font-medium">{clientName}</span></p>
                <p>Amount: <span className="font-bold">{currency} {amount.toLocaleString()}</span></p>
              </div>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="ml-auto text-green-600 hover:text-green-800 transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-green-200">
            {onViewInvoices && (
              <button
                onClick={onViewInvoices}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] font-medium text-sm"
              >
                <Eye size={16} />
                View All Invoices
                <ArrowRight size={14} />
              </button>
            )}
            
            <div className="flex gap-2">
              {onPrintInvoice && (
                <button
                  onClick={onPrintInvoice}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 rounded-lg transition-all duration-200 font-medium text-sm"
                >
                  <FileText size={14} />
                  Print
                </button>
              )}
              
              {onCreateAnother && (
                <button
                  onClick={onCreateAnother}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 rounded-lg transition-all duration-200 font-medium text-sm"
                >
                  <Save size={14} />
                  New Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};