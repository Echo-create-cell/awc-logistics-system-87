
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InvoiceDetailsProps {
  invoiceData: {
    destination: string;
    doorDelivery: string;
    deliverDate: string;
    validityDate: string;
    awbNumber: string;
    currency: string;
    paymentConditions: string;
  };
  onInvoiceDataChange: (field: string, value: string) => void;
  currencyDisabled?: boolean;
}

const InvoiceDetails = ({ invoiceData, onInvoiceDataChange, currencyDisabled }: InvoiceDetailsProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onInvoiceDataChange(e.target.id, e.target.value);
  };

  const RequiredLabel = ({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) => (
    <Label htmlFor={htmlFor} className="flex items-center gap-1">
      {children}
      <span className="text-red-500">*</span>
    </Label>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel htmlFor="destination">Destination</RequiredLabel>
            <Input
              id="destination"
              value={invoiceData.destination}
              onChange={handleChange}
              placeholder="Enter destination"
              className={!invoiceData.destination.trim() ? 'border-red-300 focus:border-red-500' : ''}
            />
          </div>
          <div>
            <RequiredLabel htmlFor="doorDelivery">Door Delivery</RequiredLabel>
            <Input
              id="doorDelivery"
              value={invoiceData.doorDelivery}
              onChange={handleChange}
              placeholder="Enter door delivery address"
              className={!invoiceData.doorDelivery.trim() ? 'border-red-300 focus:border-red-500' : ''}
            />
          </div>
          <div>
            <RequiredLabel htmlFor="deliverDate">Delivery Date</RequiredLabel>
            <Input
              id="deliverDate"
              type="date"
              value={invoiceData.deliverDate}
              onChange={handleChange}
              className={!invoiceData.deliverDate ? 'border-red-300 focus:border-red-500' : ''}
            />
          </div>
          <div>
            <RequiredLabel htmlFor="validityDate">Validity Date</RequiredLabel>
            <Input
              id="validityDate"
              type="date"
              value={invoiceData.validityDate}
              onChange={handleChange}
              className={!invoiceData.validityDate ? 'border-red-300 focus:border-red-500' : ''}
            />
          </div>
          <div>
            <RequiredLabel htmlFor="awbNumber">AWB Number</RequiredLabel>
            <Input
              id="awbNumber"
              value={invoiceData.awbNumber}
              onChange={handleChange}
              placeholder="Enter Air Waybill number"
              className={!invoiceData.awbNumber.trim() ? 'border-red-300 focus:border-red-500' : ''}
            />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select 
              value={invoiceData.currency} 
              onValueChange={(value) => onInvoiceDataChange('currency', value)}
              disabled={currencyDisabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="NGN">NGN</SelectItem>
                <SelectItem value="RWF">RWF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <RequiredLabel htmlFor="paymentConditions">Payment Conditions</RequiredLabel>
          <Textarea
            id="paymentConditions"
            value={invoiceData.paymentConditions}
            onChange={handleChange}
            placeholder="Enter payment terms and conditions"
            className={!invoiceData.paymentConditions.trim() ? 'border-red-300 focus:border-red-500' : ''}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceDetails;
