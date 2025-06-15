
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
}: QuotationFormSidebarProps) => {
  return (
    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-10">
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
      />
    </div>
  );
};

export default QuotationFormSidebar;
