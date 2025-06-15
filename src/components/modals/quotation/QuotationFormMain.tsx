import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ClientSelector from '@/components/quotations/ClientSelector';
import QuotationFormDetails from '@/components/quotations/QuotationFormDetails';
import CommodityList from '@/components/quotations/CommodityList';
import { Client, Quotation } from '@/types';
import { QuotationCommodity } from '@/types/invoice';

interface QuotationFormMainProps {
  clients: Client[];
  selectedClientId: string | undefined;
  onValueChange: (clientId: string) => void;
  quotationData: {
    currency: string;
    destination: string;
    doorDelivery: string;
    quoteSentBy: string;
    freightMode: Quotation['freightMode'];
    requestType: Quotation['requestType'];
    countryOfOrigin: string;
    cargoDescription: string;
  };
  onQuotationChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (field: string, value: string) => void;
  commodities: QuotationCommodity[];
  currency: string;
  updateCommodity: (id: string, field: 'name' | 'quantityKg' | 'rate', value: string | number) => void;
  removeCommodity: (id: string) => void;
  addCommodity: () => void;
}

const QuotationFormMain = ({
  clients,
  selectedClientId,
  onValueChange,
  quotationData,
  onQuotationChange,
  onSelectChange,
  commodities,
  currency,
  updateCommodity,
  removeCommodity,
  addCommodity,
}: QuotationFormMainProps) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      <Card>
        <CardHeader><CardTitle>Quotation Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ClientSelector
              clients={clients}
              selectedClientId={selectedClientId}
              onValueChange={onValueChange}
            />
          </div>
          <QuotationFormDetails
            quotationData={quotationData}
            onQuotationChange={onQuotationChange}
            onSelectChange={onSelectChange}
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
            currency={currency}
          />
          <Button onClick={addCommodity} variant="outline" className="mt-4">
            Add Another Commodity
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationFormMain;
