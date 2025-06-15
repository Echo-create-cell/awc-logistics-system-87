
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CommodityList from '@/components/quotations/CommodityList';
import { Quotation, User } from '@/types';
import { QuotationCommodity } from '@/types/invoice';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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
  updateCommodity: (id: string, field: 'name' | 'quantityKg' | 'rate' | 'clientRate', value: string | number) => void;
  removeCommodity: (id: string) => void;
  addCommodity: () => void;
  users: User[];
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
  users,
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
            <div>
              <Label htmlFor="freightMode">Freight Mode</Label>
              <Select onValueChange={(value) => onSelectChange('freightMode', value)} value={quotationData.freightMode}>
                <SelectTrigger id="freightMode"><SelectValue placeholder="Select mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Air Freight">Air Freight</SelectItem>
                  <SelectItem value="Ocean Freight">Ocean Freight</SelectItem>
                  <SelectItem value="Land Freight">Land Freight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="destination">Destination</Label>
              <Input id="destination" placeholder="e.g., Kigali, Rwanda" value={quotationData.destination} onChange={onQuotationChange} />
            </div>
            <div>
              <Label htmlFor="doorDelivery">Door Delivery</Label>
              <Input id="doorDelivery" placeholder="e.g., To warehouse" value={quotationData.doorDelivery} onChange={onQuotationChange} />
            </div>
            <div>
              <Label htmlFor="requestType">Request Type</Label>
              <Select onValueChange={(value) => onSelectChange('requestType', value)} value={quotationData.requestType}>
                <SelectTrigger id="requestType"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Import">Import</SelectItem>
                  <SelectItem value="Export">Export</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="countryOfOrigin">Country of Origin</Label>
              <Input id="countryOfOrigin" placeholder="e.g., China" value={quotationData.countryOfOrigin} onChange={onQuotationChange} />
            </div>
             <div>
              <Label htmlFor="quoteSentBy">Quote Sent By</Label>
              <Select onValueChange={(value) => onSelectChange('quoteSentBy', value)} value={quotationData.quoteSentBy}>
                <SelectTrigger id="quoteSentBy"><SelectValue placeholder="Select user" /></SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
               <Select onValueChange={(value) => onSelectChange('currency', value)} value={quotationData.currency}>
                <SelectTrigger id="currency"><SelectValue placeholder="Select currency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="RWF">RWF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
           <div>
              <Label htmlFor="cargoDescription">Cargo Description</Label>
              <Textarea id="cargoDescription" placeholder="Describe the cargo..." value={quotationData.cargoDescription} onChange={onQuotationChange} />
            </div>
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

