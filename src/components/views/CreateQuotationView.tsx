
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Quotation, User } from '@/types';
import CommodityList from '../quotations/CommodityList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuotationFormDetails from '../quotations/QuotationFormDetails';
import { useQuotationForm } from '@/hooks/useQuotationForm';
import ClientSelector from '../quotations/ClientSelector';
import PricingSummary from '../quotations/PricingSummary';

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
    addCharge,
    removeCharge,
    updateCharge,
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
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Quotation Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ClientSelector
                    clients={clients}
                    selectedClientId={selectedClientId}
                    onValueChange={setSelectedClientId}
                />
              </div>
              <QuotationFormDetails
                quotationData={quotationData}
                onQuotationChange={handleDetailsChange}
                onSelectChange={handleSelectChange}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Commodities</CardTitle></CardHeader>
            <CardContent>
              <CommodityList
                commodities={commodities}
                onUpdateCommodity={updateCommodity}
                onRemoveCommodity={removeCommodity}
                onAddCharge={addCharge}
                onRemoveCharge={removeCharge}
                onUpdateCharge={updateCharge}
                currency={currency}
              />
              <Button onClick={addCommodity} variant="outline" className="mt-4">
                Add Another Commodity
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-10">
          <PricingSummary
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
      </div>
      
      <div className="flex justify-end gap-2 pt-4 mt-6 border-t">
        <Button variant="outline" onClick={() => setActiveTab && setActiveTab("quotations")}>Cancel</Button>
        <Button onClick={handleSaveQuotation}>Save Quotation</Button>
      </div>
    </div>
  );
};

export default CreateQuotationView;
