import React from 'react';
import { Quotation, User } from '@/types';
import { Button } from '@/components/ui/button';
import { useQuotationForm } from '@/hooks/useQuotationForm';
import QuotationFormMain from './QuotationFormMain';
import QuotationFormSidebar from './QuotationFormSidebar';
import { useToast } from '@/hooks/use-toast';

interface QuotationFormProps {
  quotation: Quotation;
  onSave: (quotation: Quotation) => void;
  onClose: () => void;
  user: User;
  viewOnly?: boolean;
}

const QuotationForm = ({ quotation, onSave, onClose, user, viewOnly = false }: QuotationFormProps) => {
  const { toast } = useToast();
  const {
    clientName,
    setClientName,
    commodities,
    currency,
    buyRate,
    clientQuote,
    profit,
    profitPercentage,
    remarks,
    setRemarks,
    followUpDate,
    setFollowUpDate,
    quotationData,
    addCommodity,
    removeCommodity,
    updateCommodity,
    handleDetailsChange,
    handleSelectChange,
    getQuotationPayload,
  } = useQuotationForm(quotation, user);
  
  const handleSave = () => {
    if (!clientName || clientQuote <= 0 || !buyRate || !currency || !quotationData.quoteSentBy) {
      toast({
        title: "Missing Fields",
        description: "Please ensure client name, commodities, pricing, and 'Quote Sent By' are all filled in.",
        variant: "destructive",
      });
      return;
    }
    const updatedQuotation = getQuotationPayload();
    onSave(updatedQuotation);
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <QuotationFormMain
          clientName={clientName}
          onClientNameChange={(e) => setClientName(e.target.value)}
          quotationData={quotationData}
          onQuotationChange={handleDetailsChange}
          onSelectChange={handleSelectChange}
          commodities={commodities}
          currency={currency}
          updateCommodity={updateCommodity}
          removeCommodity={removeCommodity}
          addCommodity={addCommodity}
          viewOnly={viewOnly}
        />
        <QuotationFormSidebar
          currency={currency}
          buyRate={buyRate}
          clientQuote={clientQuote}
          profit={profit}
          profitPercentage={profitPercentage}
          remarks={remarks}
          onRemarksChange={setRemarks}
          followUpDate={followUpDate}
          onFollowUpDateChange={setFollowUpDate}
          viewOnly={viewOnly}
        />
      </div>
      {!viewOnly && (
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      )}
      {viewOnly && (
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      )}
    </div>
  );
};

export default QuotationForm;
