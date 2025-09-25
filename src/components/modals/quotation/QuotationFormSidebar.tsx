
import React from 'react';
import PricingSummary from '@/components/quotations/PricingSummary';

interface QuotationFormSidebarProps {
  currency: string;
  buyRate: number;
  clientQuote: number;
  profit: number;
  profitPercentage: number;
  remarks: string;
  onRemarksChange: (value: string) => void;
  followUpDate?: string;
  onFollowUpDateChange?: (value: string) => void;
  viewOnly?: boolean;
}

const QuotationFormSidebar = ({
  currency,
  buyRate,
  clientQuote,
  profit,
  profitPercentage,
  remarks,
  onRemarksChange,
  followUpDate,
  onFollowUpDateChange,
  viewOnly = false,
}: QuotationFormSidebarProps) => {
  return (
    <div className="space-y-6 sticky top-0">
      <PricingSummary
        currency={currency}
        buyRate={buyRate}
        clientQuote={clientQuote}
        profit={profit}
        profitPercentage={profitPercentage}
        remarks={remarks}
        onRemarksChange={onRemarksChange}
        followUpDate={followUpDate}
        onFollowUpDateChange={onFollowUpDateChange}
        viewOnly={viewOnly}
      />
    </div>
  );
};

export default QuotationFormSidebar;
