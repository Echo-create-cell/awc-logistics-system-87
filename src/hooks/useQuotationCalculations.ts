
import { useState, useEffect, useCallback } from 'react';
import { QuotationCommodity } from '@/types/invoice';

export const useQuotationCalculations = (commodities: QuotationCommodity[]) => {
    const [buyRate, setBuyRate] = useState(0);
    const [clientQuote, setClientQuote] = useState(0);
    const [profit, setProfit] = useState(0);
    const [profitPercentage, setProfitPercentage] = useState(0);

    const calculateTotals = useCallback(() => {
        const totalBuyRate = commodities.reduce((sum, commodity) => {
          const commodityRate = Number(commodity.rate) || 0;
          const quantity = Number(commodity.quantityKg) || 0;
          return sum + (commodityRate * quantity);
        }, 0);
        setBuyRate(totalBuyRate);
        
        const totalClientQuote = commodities.reduce((sum, commodity) => {
            const commodityClientRate = Number(commodity.clientRate) || 0;
            const quantity = Number(commodity.quantityKg) || 0;
            return sum + (commodityClientRate * quantity);
        }, 0);
        setClientQuote(totalClientQuote);
    
        const p = totalClientQuote - totalBuyRate;
        const pp = totalBuyRate > 0 ? (p / totalBuyRate) * 100 : 0;
        setProfit(p);
        setProfitPercentage(pp);
      }, [commodities]);
    
      useEffect(() => {
        calculateTotals();
      }, [commodities, calculateTotals]);

    return {
        buyRate,
        clientQuote,
        profit,
        profitPercentage,
    };
};
