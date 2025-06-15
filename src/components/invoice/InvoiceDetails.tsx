
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              value={invoiceData.destination}
              onChange={handleChange}
              placeholder="Destination"
            />
          </div>
          <div>
            <Label htmlFor="doorDelivery">Door Delivery</Label>
            <Input
              id="doorDelivery"
              value={invoiceData.doorDelivery}
              onChange={handleChange}
              placeholder="Door delivery address"
            />
          </div>
          <div>
            <Label htmlFor="deliverDate">Delivery Date</Label>
            <Input
              id="deliverDate"
              type="date"
              value={invoiceData.deliverDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="validityDate">Validity Date</Label>
            <Input
              id="validityDate"
              type="date"
              value={invoiceData.validityDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="awbNumber">AWB Number</Label>
            <Input
              id="awbNumber"
              value={invoiceData.awbNumber}
              onChange={handleChange}
              placeholder="Air Waybill number"
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
          <Label htmlFor="paymentConditions">Payment Conditions</Label>
          <Textarea
            id="paymentConditions"
            value={invoiceData.paymentConditions}
            onChange={handleChange}
            placeholder="Payment terms and conditions"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceDetails;
