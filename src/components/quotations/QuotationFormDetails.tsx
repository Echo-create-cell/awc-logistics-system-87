
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QuotationFormDetailsProps {
  quotationData: {
    clientName: string;
    currency: string;
    destination: string;
    doorDelivery: string;
    quoteSentBy: string;
  };
  onQuotationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCurrencyChange: (value: string) => void;
}

const QuotationFormDetails = ({ quotationData, onQuotationChange, onCurrencyChange }: QuotationFormDetailsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="clientName">Client Name</Label>
        <Input id="clientName" placeholder="Client name" value={quotationData.clientName} onChange={onQuotationChange} />
      </div>
       <div>
        <Label htmlFor="currency">Currency</Label>
        <Select value={quotationData.currency} onValueChange={onCurrencyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="RWF">RWF</SelectItem>
            <SelectItem value="EUR">EUR (€)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="destination">Destination</Label>
        <Input id="destination" placeholder="Destination" value={quotationData.destination} onChange={onQuotationChange} />
      </div>
      <div>
        <Label htmlFor="doorDelivery">Door Delivery</Label>
        <Input id="doorDelivery" placeholder="Door Delivery" value={quotationData.doorDelivery} onChange={onQuotationChange} />
      </div>
       <div className="md:col-span-2">
        <Label htmlFor="quoteSentBy">Quote Sent By</Label>
        <Input id="quoteSentBy" placeholder="Enter sender name" value={quotationData.quoteSentBy} onChange={onQuotationChange} />
      </div>
    </div>
  );
};

export default QuotationFormDetails;
