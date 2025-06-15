
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
    userList,
  } = useQuotationForm(null, user);

  const handleSaveQuotation = () => {
    if (!clientName || clientQuote <= 0 || !buyRate || !currency || !quotationData.quoteSentBy) {
      toast({
        title: "Missing Fields",
        description: "Please ensure client name, commodities, pricing, and 'Quote Sent By' are all filled in.",
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
          users={userList}
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
