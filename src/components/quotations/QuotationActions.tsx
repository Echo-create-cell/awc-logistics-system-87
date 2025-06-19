
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, CheckCircle, XCircle } from 'lucide-react';
import { Quotation, User } from '@/types';

interface QuotationActionsProps {
  quotation: Quotation;
  user: User;
  onApprove?: (id: string) => void;
  onReject?: (quotation: Quotation) => void;
  onInvoiceFromQuotation?: (quotation: Quotation) => void;
  onEdit?: (quotation: Quotation) => void;
}

const QuotationActions = ({
  quotation: row,
  user,
  onApprove,
  onReject,
  onInvoiceFromQuotation,
  onEdit,
}: QuotationActionsProps) => {
  return (
    <div className="flex gap-2 items-center">
      {user.role === 'admin' && row.status === 'pending' && (
        <>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onApprove?.(row.id)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1"
            title="Approve"
          >
            <CheckCircle size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onReject?.(row)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
            title="Reject"
          >
            <XCircle size={16} />
          </Button>
        </>
      )}
      {(user.role === 'sales_director' || user.role === 'sales_agent') && row.status === 'won' && (
        (!row.linkedInvoiceIds || row.linkedInvoiceIds.length === 0) ? (
          <Button
            size="sm"
            className="px-2 py-1 text-white bg-fuchsia-700 rounded hover:bg-fuchsia-900 text-xs"
            onClick={() => onInvoiceFromQuotation?.(row)}
          >
            Generate Invoice
          </Button>
        ) : (
          <Badge variant="secondary">Invoice Generated</Badge>
        )
      )}
      {/* Only sales_director can edit quotations - admin cannot edit */}
      {user.role === 'sales_director' && (row.status === 'pending' || row.status === 'lost') && (
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => onEdit?.(row)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          title="Edit"
        >
          <Edit size={16} />
        </Button>
      )}
    </div>
  );
};

export default QuotationActions;
