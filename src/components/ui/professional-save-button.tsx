import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save, CheckCircle } from 'lucide-react';
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
    default: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
    success: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
    primary: "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
  };

  const sizeStyles = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5",
    lg: "px-6 py-3 text-base"
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles[variant],
        sizeStyles[size],
        "shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-white font-semibold relative overflow-hidden",
        "before:absolute before:inset-0 before:bg-white before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-10",
        isLoading && "cursor-not-allowed",
        className
      )}
    >
      <div className="flex items-center justify-center space-x-2 relative z-10">
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            <Save size={18} className="transition-transform duration-200 group-hover:scale-110" />
            <span>{children || successText}</span>
          </>
        )}
      </div>
      
      {/* Animated background effect */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      )}
    </Button>
  );
};

// Enhanced success feedback component
interface SaveSuccessNotificationProps {
  isVisible: boolean;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
}

export const SaveSuccessNotification = ({
  isVisible,
  invoiceNumber,
  clientName,
  amount,
  currency
}: SaveSuccessNotificationProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-xl p-4 max-w-md">
        <div className="flex items-start space-x-3">
          <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-green-900">Invoice Created Successfully!</h4>
            <div className="text-sm text-green-800 space-y-0.5">
              <p>Invoice #{invoiceNumber}</p>
              <p>Client: {clientName}</p>
              <p>Amount: {currency} {amount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};