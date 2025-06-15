import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PricingSummaryProps {
  currency: string;
  buyRate: number;
  clientQuote: number;
  profit: number;
  profitPercentage: number;
  remarks: string;
  onRemarksChange: (value: string) => void;
  followUpDate?: string;
  onFollowUpDateChange?: (value: string) => void;
}

const PricingSummary = ({
  currency,
  buyRate,
  clientQuote,
  profit,
  profitPercentage,
  remarks,
  onRemarksChange,
  followUpDate,
  onFollowUpDateChange,
}: PricingSummaryProps) => {
  return (
    <Card>
      <CardHeader><CardTitle>Pricing & Follow-up</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Total Buy Rate ({currency})</Label>
          <Input value={buyRate.toFixed(2)} disabled className="mt-1" />
        </div>
        <div>
          <Label>Client Quote ({currency})</Label>
          <Input 
            type="number" 
            value={clientQuote.toFixed(2)} 
            disabled
            className="mt-1"
          />
        </div>
        <div>
          <Label>Profit ({currency})</Label>
          <Input value={profit.toFixed(2)} disabled className="mt-1" />
        </div>
        <div>
          <Label>Profit Margin (%)</Label>
          <Input value={profitPercentage.toFixed(2)} disabled className="mt-1" />
        </div>
        {onFollowUpDateChange && (
            <div>
                <Label htmlFor="followUpDate">Follow Up Date</Label>
                <Input 
                    id="followUpDate" 
                    type="date" 
                    value={followUpDate} 
                    onChange={e => onFollowUpDateChange(e.target.value)}
                    className="mt-1"
                />
            </div>
        )}
        <div>
          <Label>Remarks</Label>
          <Textarea 
            value={remarks} 
            onChange={e => onRemarksChange(e.target.value)} 
            placeholder="Add any follow-up notes or remarks..."
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingSummary;
