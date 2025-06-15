
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuotationFormDetails from '@/components/quotations/QuotationFormDetails';
import CommodityList from '@/components/quotations/CommodityList';
import { Quotation } from '@/types';
import { QuotationCommodity } from '@/types/invoice';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface QuotationFormMainProps {
  clientName: string;
  onClientNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  clientName,
  onClientNameChange,
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
            <div>
              <Label htmlFor="clientName">Client</Label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                value={clientName}
                onChange={onClientNameChange}
              />
            </div>
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
