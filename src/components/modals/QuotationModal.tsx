
import React, { useState } from "react";
import { Quotation, User } from "@/types";
import QuotationForm from "./quotation/QuotationForm";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Printer } from "lucide-react";
import QuotationPrintPreview from "../QuotationPrintPreview";
import { ModalWrapper } from "@/components/ui/modal-wrapper";
import { ActionButtonGroup } from "@/components/ui/action-button-group";

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'won':
        return { text: status, variant: 'default' as const };
      case 'lost':
        return { text: status, variant: 'destructive' as const };
      default:
        return { text: status, variant: 'secondary' as const };
    }
  };

  const actionButtons = [
    {
      label: 'Print',
      onClick: handlePrint,
      variant: 'outline' as const,
      icon: Printer
    }
  ];

  return (
    <>
      <ModalWrapper
        open={open}
        onClose={onClose}
        title={viewOnly ? 'View Quotation Details' : 'Edit Quotation'}
        description={
          viewOnly 
            ? 'Review quotation details and information.' 
            : 'Update quotation details. Profit will be calculated automatically.'
        }
        icon={viewOnly ? Eye : Edit}
        iconVariant={viewOnly ? 'info' : 'default'}
        badge={quotation ? getStatusBadge(quotation.status) : undefined}
        size="xl"
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 space-y-6">
            {quotation && (
              <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg border border-border/20">
                <div className="flex items-center justify-between">
                  <span>Client: <strong className="text-foreground">{quotation.clientName}</strong></span>
                  <span>Quote: <strong className="text-foreground">{quotation.currency} {quotation.clientQuote?.toLocaleString()}</strong></span>
                </div>
              </div>
            )}
            
            {quotation && (
              <QuotationForm
                quotation={quotation}
                onSave={handleSaveForm}
                onClose={onClose}
                user={user}
                viewOnly={viewOnly}
              />
            )}
          </div>
          
          <div className="flex-shrink-0 pt-6 border-t border-border/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky bottom-0">
            <ActionButtonGroup
              buttons={actionButtons}
              alignment="right"
              size="sm"
            />
          </div>
        </div>
      </ModalWrapper>
      
      {showPrintPreview && quotation && (
        <QuotationPrintPreview
          quotation={quotation}
          onClose={() => setShowPrintPreview(false)}
          onPrint={handlePrintComplete}
        />
      )}
    </>
  );
};

export default QuotationModal;
