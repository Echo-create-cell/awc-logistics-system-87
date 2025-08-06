
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Quotation, User } from "@/types";
import QuotationForm from "./quotation/QuotationForm";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Edit } from "lucide-react";

interface QuotationModalProps {
  open: boolean;
  quotation: Quotation | null;
  onClose: () => void;
  onSave: (q: Quotation) => void;
  user: User;
  viewOnly?: boolean;
}

const QuotationModal = ({ open, quotation, onClose, onSave, user, viewOnly = false }: QuotationModalProps) => {
  const handleSaveForm = (updatedQuotation: Quotation) => {
    onSave(updatedQuotation);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${viewOnly ? 'bg-blue-100' : 'bg-green-100'}`}>
              {viewOnly ? (
                <Eye className="h-5 w-5 text-blue-600" />
              ) : (
                <Edit className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                {viewOnly ? 'View Quotation Details' : 'Edit Quotation'}
                {quotation && (
                  <Badge 
                    variant={quotation.status === 'won' ? "default" : quotation.status === 'lost' ? "destructive" : "secondary"} 
                    className={
                      quotation.status === 'won' ? "bg-success/10 text-success border-success/20" : 
                      quotation.status === 'lost' ? "bg-destructive/10 text-destructive border-destructive/20" : 
                      "bg-warning/10 text-warning border-warning/20"
                    }
                  >
                    {quotation.status}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                {viewOnly 
                  ? 'Review quotation details and information.' 
                  : 'Update quotation details. Profit will be calculated automatically.'
                }
                {quotation && (
                  <span className="block mt-1 text-sm">
                    Client: <strong>{quotation.clientName}</strong> • 
                    Quote: <strong>{quotation.currency} {quotation.clientQuote?.toLocaleString()}</strong>
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        {quotation && (
          <QuotationForm
            quotation={quotation}
            onSave={handleSaveForm}
            onClose={onClose}
            user={user}
            viewOnly={viewOnly}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuotationModal;
