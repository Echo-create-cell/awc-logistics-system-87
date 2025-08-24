import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Quotation, User } from '@/types';
import { useQuotationForm } from '@/hooks/useQuotationForm';
import QuotationFormMain from '../modals/quotation/QuotationFormMain';
import QuotationFormSidebar from '../modals/quotation/QuotationFormSidebar';

interface CreateQuotationViewProps {
  onQuotationCreated: (quotation: Quotation) => void;
  setActiveTab?: (tab: string) => void;
  user: User;
}

const CreateQuotationView = ({ onQuotationCreated, setActiveTab, user }: CreateQuotationViewProps) => {
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
    resetForm,
  } = useQuotationForm(null, user);

  const handleSaveQuotation = async () => {
    // Enhanced validation with specific field checks
    const validationErrors = [];
    
    if (!clientName || clientName.trim() === '') {
      validationErrors.push("Client name is required");
    }
    
    if (commodities.length === 0) {
      validationErrors.push("At least one commodity is required");
    }
    
    if (clientQuote <= 0) {
      validationErrors.push("Client quote must be greater than 0");
    }
    
    if (!currency) {
      validationErrors.push("Currency is required");
    }
    
    if (!quotationData.quoteSentBy || quotationData.quoteSentBy.trim() === '') {
      validationErrors.push("Quote Sent By is required");
    }

    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", "),
        variant: "destructive",
      });
      return;
    }

    try {
      const newQuotation = getQuotationPayload();
      console.log('Saving quotation:', newQuotation); // Debug log
      await onQuotationCreated(newQuotation);
      
      toast({
        title: "Success",
        description: "Quotation created successfully and sent for approval!",
      });
      
      resetForm();
    } catch (error) {
      console.error('Failed to save quotation:', error);
      toast({
        title: "Save Failed", 
        description: "Failed to save quotation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Create New Quotation</h2>
          <p className="text-muted-foreground mt-1">Fill in the details to generate a new quotation for a client.</p>
        </div>
      </div>

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
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4 mt-6 border-t">
        <Button variant="outline" onClick={() => setActiveTab && setActiveTab("quotations")}>Cancel</Button>
        <Button onClick={handleSaveQuotation}>Save Quotation</Button>
      </div>
    </div>
  );
};

export default CreateQuotationView;
