
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface QuotationSummaryProps {
  quotationData: {
    buyRate: string;
    followUpDate: string;
    remarks: string;
    currency: string;
  };
  clientQuoteTotal: number;
  calculatedProfit: {
    profit: number;
    profitPercentage: string;
  };
  onQuotationChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const QuotationSummary = ({
  quotationData,
  clientQuoteTotal,
  calculatedProfit,
  onQuotationChange,
}: QuotationSummaryProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
        <div>
          <Label htmlFor="buyRate">Total Buy Rate</Label>
          <Input id="buyRate" type="number" placeholder="0.00" value={quotationData.buyRate} onChange={onQuotationChange} />
        </div>
        <div>
          <Label htmlFor="clientQuote">Client Quote (Total Sell Rate)</Label>
          <Input id="clientQuote" type="text" value={`${quotationData.currency} ${clientQuoteTotal.toLocaleString()}`} readOnly disabled className="bg-slate-100" />
        </div>
        <div>
          <Label htmlFor="profit">Profit (Absolute)</Label>
          <Input id="profit" type="text" value={`${quotationData.currency} ${calculatedProfit.profit.toLocaleString()}`} readOnly disabled className="bg-slate-100" />
        </div>
        <div>
          <Label htmlFor="profitPercentage">Profit (% of Cost)</Label>
          <Input id="profitPercentage" type="text" value={calculatedProfit.profitPercentage} readOnly disabled className="bg-slate-100" />
        </div>
        <div>
          <Label htmlFor="followUpDate">Follow Up Date</Label>
          <Input id="followUpDate" type="date" value={quotationData.followUpDate} onChange={onQuotationChange} />
        </div>
      </div>
      <div>
        <Label htmlFor="remarks">Remarks (inc. reasons for lost business)</Label>
        <Textarea id="remarks" placeholder="Additional notes or remarks" value={quotationData.remarks} onChange={onQuotationChange} />
      </div>
    </>
  );
};

export default QuotationSummary;
