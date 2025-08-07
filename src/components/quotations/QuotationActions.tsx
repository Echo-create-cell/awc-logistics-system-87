
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, CheckCircle, XCircle, Eye, Printer } from 'lucide-react';
import { Quotation, User } from '@/types';

interface QuotationActionsProps {
  quotation: Quotation;
  user: User;
  onApprove?: (id: string) => void;
  onReject?: (quotation: Quotation) => void;
  onInvoiceFromQuotation?: (quotation: Quotation) => void;
  onEdit?: (quotation: Quotation) => void;
  onView?: (quotation: Quotation) => void;
  onPrint?: (quotation: Quotation) => void;
}

const QuotationActions = ({
  quotation: row,
  user,
  onApprove,
  onReject,
  onInvoiceFromQuotation,
  onEdit,
  onView,
  onPrint,
}: QuotationActionsProps) => {
  return (
    <div className="flex gap-2 items-center">
      {/* Admin approval/rejection actions */}
      {user.role === 'admin' && row.status === 'pending' && (
        <>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onApprove?.(row.id)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 gap-1.5"
            title="Approve Quotation"
          >
            <CheckCircle size={14} />
            <span className="text-xs font-medium">Approve</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onReject?.(row)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 gap-1.5"
            title="Reject Quotation"
          >
            <XCircle size={14} />
            <span className="text-xs font-medium">Reject</span>
          </Button>
        </>
      )}
      
      {/* Print button for all users */}
      {onPrint && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onPrint(row)}
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 gap-1.5"
          title="Print Quotation"
        >
          <Printer size={14} />
          <span className="text-xs font-medium">Print</span>
        </Button>
      )}

      {/* Admin and Partner view-only for quotations */}
      {(user.role === 'admin' || user.role === 'partner') && onView && (
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => onView(row)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 gap-1.5"
          title="View Quotation Details"
        >
          <Eye size={14} />
          <span className="text-xs font-medium">View</span>
        </Button>
      )}
      
      {/* Invoice generation for sales roles */}
      {(user.role === 'sales_director' || user.role === 'sales_agent') && row.status === 'won' && (
        (!row.linkedInvoiceIds || row.linkedInvoiceIds.length === 0) ? (
          <Button
            size="sm"
            className="px-3 py-1.5 text-white bg-primary hover:bg-primary/90 text-xs font-medium gap-1.5"
            onClick={() => onInvoiceFromQuotation?.(row)}
            title="Generate Invoice from Quotation"
          >
            <span>Generate Invoice</span>
          </Button>
        ) : (
          <Badge variant="secondary" className="text-xs px-2 py-1">✓ Invoice Generated</Badge>
        )
      )}
      
      {/* Only sales_director can edit quotations - admin and others cannot edit */}
      {user.role === 'sales_director' && (row.status === 'pending' || row.status === 'lost') && onEdit && (
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => onEdit(row)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 gap-1.5"
          title="Edit Quotation"
        >
          <Edit size={14} />
          <span className="text-xs font-medium">Edit</span>
        </Button>
      )}
    </div>
  );
};

export default QuotationActions;
