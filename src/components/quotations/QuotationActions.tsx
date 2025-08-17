
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye, Edit, FileText } from 'lucide-react';
import { Quotation, User } from '@/types';
import { ActionButtonGroup } from '@/components/ui/action-button-group';

interface QuotationActionsProps {
  quotation: Quotation;
  user: User;
  onApprove?: (id: string) => void;
  onReject?: (quotation: Quotation) => void;
  onInvoiceFromQuotation?: (quotation: Quotation) => void;
  onEdit?: (quotation: Quotation) => void;
  onView?: (quotation: Quotation) => void;
}

const QuotationActions = ({
  quotation: row,
  user,
  onApprove,
  onReject,
  onInvoiceFromQuotation,
  onEdit,
  onView,
}: QuotationActionsProps) => {
  const buttons = [];

  // Admin approval/rejection actions
  if (user.role === 'admin' && row.status === 'pending') {
    buttons.push(
      {
        label: 'Approve',
        onClick: () => onApprove?.(row.id),
        variant: 'success' as const,
        icon: CheckCircle
      },
      {
        label: 'Reject',
        onClick: () => onReject?.(row),
        variant: 'destructive' as const,
        icon: XCircle
      }
    );
  }

  // Admin and Partner view-only for quotations
  if ((user.role === 'admin' || user.role === 'partner') && onView) {
    buttons.push({
      label: 'View',
      onClick: () => onView(row),
      variant: 'outline' as const,
      icon: Eye
    });
  }

  // Invoice generation for sales roles
  if ((user.role === 'sales_director' || user.role === 'sales_agent') && row.status === 'won') {
    if (!row.linkedInvoiceIds || row.linkedInvoiceIds.length === 0) {
      buttons.push({
        label: 'Generate Invoice',
        onClick: () => onInvoiceFromQuotation?.(row),
        variant: 'default' as const,
        icon: FileText
      });
    }
  }

  // Only sales_director can edit quotations
  if (user.role === 'sales_director' && (row.status === 'pending' || row.status === 'lost') && onEdit) {
    buttons.push({
      label: 'Edit',
      onClick: () => onEdit(row),
      variant: 'outline' as const,
      icon: Edit
    });
  }

  return (
    <div className="flex items-center gap-2">
      {/* Show badge if invoice is already generated */}
      {(user.role === 'sales_director' || user.role === 'sales_agent') && 
       row.status === 'won' && 
       row.linkedInvoiceIds && 
       row.linkedInvoiceIds.length > 0 && (
        <Badge variant="secondary" className="text-xs px-2 py-1 bg-background text-success border-success/20 shadow-soft">
          ✓ Invoice Generated
        </Badge>
      )}
      
      {buttons.length > 0 && (
        <ActionButtonGroup
          buttons={buttons.map(btn => ({
            ...btn,
            className: `${btn.className || ''} bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 shadow-soft`
          }))}
          size="sm"
          alignment="left"
        />
      )}
    </div>
  );
};

export default QuotationActions;
