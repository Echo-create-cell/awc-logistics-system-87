
import { useState, useEffect } from 'react';
import { Quotation } from '@/types';
import { QuotationCommodity } from '@/types/invoice';
import { v4 as uuidv4 } from 'uuid';

export const useCommodityManager = (initialQuotation: Quotation | null) => {
  const [commodities, setCommodities] = useState<QuotationCommodity[]>([]);

  const addCommodity = () => {
    const newCommodity: QuotationCommodity = { id: uuidv4(), name: '', quantityKg: 0, rate: 0, clientRate: 0 };
    setCommodities(prev => [...prev, newCommodity]);
  };

  useEffect(() => {
    if (initialQuotation) {
      try {
        const parsed = JSON.parse(initialQuotation.volume);
        if (Array.isArray(parsed)) {
          const totalQuantity = parsed.reduce((sum: number, c: any) => sum + (Number(c.quantityKg) || 0), 0);
          const avgClientRate = totalQuantity > 0 && initialQuotation.clientQuote ? initialQuotation.clientQuote / totalQuantity : 0;

          const commoditiesWithRate = parsed.map((c: any) => ({
            id: c.id || uuidv4(),
            name: c.name || '',
            quantityKg: c.quantityKg || 0,
            rate: c.rate !== undefined ? c.rate : (c.charges ? c.charges.reduce((sum: number, charge: any) => sum + (Number(charge.rate) || 0), 0) : 0),
            clientRate: c.clientRate !== undefined ? c.clientRate : avgClientRate,
          }));
          setCommodities(commoditiesWithRate);
        }
      } catch (e) {
        console.error("Failed to parse commodities from quotation volume", e);
        setCommodities([]);
      }
    } else {
        addCommodity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuotation]);

  const removeCommodity = (id: string) => {
    if (commodities.length > 1) setCommodities(prev => prev.filter(c => c.id !== id));
  };

  const updateCommodity = (id: string, field: 'name' | 'quantityKg' | 'rate' | 'clientRate', value: string | number) => {
    setCommodities(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  
  return {
    commodities,
    setCommodities,
    addCommodity,
    removeCommodity,
    updateCommodity,
  };
};
