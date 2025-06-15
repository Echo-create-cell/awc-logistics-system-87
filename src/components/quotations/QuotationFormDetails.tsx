
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Quotation } from '@/types';
import { Textarea } from '../ui/textarea';

interface QuotationFormDetailsProps {
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
}

const QuotationFormDetails = ({ quotationData, onQuotationChange, onSelectChange }: QuotationFormDetailsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div>
        <Label htmlFor="freightMode">Freight Mode</Label>
        <Select value={quotationData.freightMode} onValueChange={(value) => onSelectChange('freightMode', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select freight mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Air Freight">Air Freight</SelectItem>
            <SelectItem value="Sea Freight">Sea Freight</SelectItem>
            <SelectItem value="Road Freight">Road Freight</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="cargoDescription">Cargo Description</Label>
        <Textarea id="cargoDescription" placeholder="Describe the cargo..." value={quotationData.cargoDescription} onChange={onQuotationChange} />
      </div>
      <div>
        <Label htmlFor="requestType">Request Type</Label>
        <Select value={quotationData.requestType} onValueChange={(value) => onSelectChange('requestType', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select request type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Import">Import</SelectItem>
            <SelectItem value="Export">Export</SelectItem>
            <SelectItem value="Re-Import">Re-Import</SelectItem>
            <SelectItem value="Project">Project</SelectItem>
            <SelectItem value="Local">Local</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="currency">Currency</Label>
        <Select value={quotationData.currency} onValueChange={(value) => onSelectChange('currency', value)}>
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
        <Label htmlFor="countryOfOrigin">Country of Origin</Label>
        <Input id="countryOfOrigin" placeholder="Country of Origin" value={quotationData.countryOfOrigin} onChange={onQuotationChange} />
      </div>
      <div className="md:col-span-2">
        <Label>Destination & Door Delivery</Label>
        <Input id="destination" placeholder="Destination Country" value={quotationData.destination} onChange={onQuotationChange} />
        <Input id="doorDelivery" placeholder="Door Delivery Address" value={quotationData.doorDelivery} onChange={onQuotationChange} className="mt-2" />
      </div>
       <div className="md:col-span-2">
        <Label htmlFor="quoteSentBy">Quote Sent By</Label>
        <Input id="quoteSentBy" placeholder="Enter sender name" value={quotationData.quoteSentBy} onChange={onQuotationChange} />
      </div>
    </div>
  );
};

export default QuotationFormDetails;
