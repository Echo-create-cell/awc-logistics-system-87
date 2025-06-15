
import React from 'react';
import { Quotation, User } from '@/types';
import CommodityList from '../../quotations/CommodityList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuotationFormDetails from '../../quotations/QuotationFormDetails';
import { useQuotationForm } from '@/hooks/useQuotationForm';
import ClientSelector from '@/components/quotations/ClientSelector';
import PricingSummary from '@/components/quotations/PricingSummary';

interface QuotationFormProps {
  quotation: Quotation;
  onSave: (quotation: Quotation) => void;
  onClose: () => void;
  user: User;
}

const QuotationForm = ({ quotation, onSave, onClose, user }: QuotationFormProps) => {
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
    followUpDate,
    setFollowUpDate,
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
  } = useQuotationForm(quotation, user);
  
  const handleSave = () => {
    const updatedQuotation = getQuotationPayload();
    onSave(updatedQuotation);
  };

  return (
    <div className="space-y-6 pt-4">
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
            followUpDate={followUpDate}
            onFollowUpDateChange={setFollowUpDate}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};

export default QuotationForm;
