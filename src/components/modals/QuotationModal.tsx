
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Quotation, User } from "@/types";
import QuotationForm from "./quotation/QuotationForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Edit, Printer } from "lucide-react";
import QuotationPrintPreview from "../QuotationPrintPreview";

interface QuotationModalProps {
  open: boolean;
  quotation: Quotation | null;
  onClose: () => void;
  onSave: (q: Quotation) => void;
  user: User;
  viewOnly?: boolean;
}

const QuotationModal = ({ open, quotation, onClose, onSave, user, viewOnly = false }: QuotationModalProps) => {
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  
  const handleSaveForm = (updatedQuotation: Quotation) => {
    onSave(updatedQuotation);
    onClose();
  };

  const handlePrint = () => {
    setShowPrintPreview(true);
  };

  const handlePrintComplete = () => {
    setShowPrintPreview(false);
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
                      quotation.status === 'won' ? "bg-green-100 text-green-800" : 
                      quotation.status === 'lost' ? "bg-red-100 text-red-800" : 
                      "bg-yellow-100 text-yellow-800"
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
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrint}
                className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Printer size={16} />
                Print
              </Button>
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
      
      {showPrintPreview && quotation && (
        <QuotationPrintPreview
          quotation={quotation}
          onClose={() => setShowPrintPreview(false)}
          onPrint={handlePrintComplete}
        />
      )}
    </Dialog>
  );
};

export default QuotationModal;
