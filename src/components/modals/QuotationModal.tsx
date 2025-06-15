
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Quotation, User } from "@/types";
import QuotationForm from "./quotation/QuotationForm";

interface QuotationModalProps {
  open: boolean;
  quotation: Quotation | null;
  onClose: () => void;
  onSave: (q: Quotation) => void;
  user: User;
}

const QuotationModal = ({ open, quotation, onClose, onSave, user }: QuotationModalProps) => {
  const handleSaveForm = (updatedQuotation: Quotation) => {
    onSave(updatedQuotation);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Quotation</DialogTitle>
          <DialogDescription>
            Update quotation details. Profit will be calculated automatically.
          </DialogDescription>
        </DialogHeader>
        
        {quotation && (
          <QuotationForm
            quotation={quotation}
            onSave={handleSaveForm}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuotationModal;
