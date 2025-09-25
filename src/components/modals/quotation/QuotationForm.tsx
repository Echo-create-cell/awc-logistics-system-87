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
    if (!clientName || clientQuote <= 0 || !currency || !quotationData.quoteSentBy) {
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
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6 pt-4 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start h-full">
          <div className="lg:col-span-2 min-h-0">
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
          </div>
          <div className="lg:col-span-1">
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
        </div>
      </div>
      
      {!viewOnly && (
        <div className="flex-shrink-0 flex justify-end gap-3 pt-6 border-t border-border/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky bottom-0 mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="min-w-[100px] shadow-soft hover:shadow-medium transition-all duration-200"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="min-w-[120px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-soft hover:shadow-medium transition-all duration-200"
          >
            Save Changes
          </Button>
        </div>
      )}
      {viewOnly && (
        <div className="flex-shrink-0 flex justify-end pt-6 border-t border-border/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky bottom-0 mt-6">
          <Button 
            onClick={onClose}
            className="min-w-[100px] bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 shadow-soft hover:shadow-medium transition-all duration-200"
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuotationForm;
