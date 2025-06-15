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
    clients,
    selectedClientId,
    setSelectedClientId,
    commodities,
    currency,
    buyRate,
    clientQuote,
    setClientQuote,
    profit,
    profitPercentage,
    remarks,
    setRemarks,
    quotationData,
    addCommodity,
    removeCommodity,
    updateCommodity,
    handleDetailsChange,
    handleSelectChange,
    getQuotationPayload,
    resetForm,
  } = useQuotationForm(null, user);

  const handleSaveQuotation = () => {
    if (!selectedClientId || clientQuote <= 0 || !buyRate || !currency) {
      toast({
        title: "Missing Fields",
        description: "Please select a client, and fill in commodities and pricing details.",
        variant: "destructive",
      });
      return;
    }

    const newQuotation = getQuotationPayload();
    onQuotationCreated(newQuotation);
    resetForm();
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
          clients={clients}
          selectedClientId={selectedClientId}
          onValueChange={setSelectedClientId}
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
          onClientQuoteChange={setClientQuote}
          profit={profit}
          profitPercentage={profitPercentage}
          remarks={remarks}
          onRemarksChange={setRemarks}
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
