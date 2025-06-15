import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Quotation, User } from '@/types';
import { QuotationCommodity } from '@/types/invoice';
import { v4 as uuidv4 } from 'uuid';
import QuotationFormDetails from '../quotations/QuotationFormDetails';
import CommodityList from '../quotations/CommodityList';
import QuotationSummary from '../quotations/QuotationSummary';

interface CreateQuotationViewProps {
  user: User;
  onQuotationCreated: (quotation: Quotation) => void;
}

const initialQuotationState = {
  clientName: '',
  currency: 'USD',
  buyRate: '',
  followUpDate: '',
  remarks: '',
  destination: '',
  doorDelivery: '',
  quoteSentBy: '',
};

const CreateQuotationView = ({ user, onQuotationCreated }: CreateQuotationViewProps) => {
  const { toast } = useToast();
  const [newQuotation, setNewQuotation] = useState(initialQuotationState);
  const [commodities, setCommodities] = useState<QuotationCommodity[]>([
    { id: uuidv4(), name: '', quantityKg: 0, rate: 0 },
  ]);

  const [calculatedProfit, setCalculatedProfit] = useState({
    profit: 0,
    profitPercentage: '0.00%',
  });

  const clientQuoteTotal = commodities.reduce((acc, commodity) => {
    return acc + (commodity.quantityKg || 0) * (commodity.rate || 0);
  }, 0);

  useEffect(() => {
    const buyRate = parseFloat(newQuotation.buyRate);

    if (!isNaN(buyRate) && buyRate > 0) {
      const profit = clientQuoteTotal - buyRate;
      const profitPercentage = `${((profit / buyRate) * 100).toFixed(2)}%`;
      setCalculatedProfit({ profit, profitPercentage });
    } else {
      const profit = !isNaN(clientQuoteTotal) && !isNaN(buyRate) ? clientQuoteTotal - buyRate : 0;
      setCalculatedProfit({ profit: profit, profitPercentage: 'N/A' });
    }
  }, [newQuotation.buyRate, clientQuoteTotal]);

  const handleNewQuotationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewQuotation(prev => ({ ...prev, [id]: value }));
  };

  const handleCurrencyChange = (value: string) => {
    setNewQuotation(prev => ({ ...prev, currency: value }));
  };
  
  const handleAddCommodity = () => {
    setCommodities([...commodities, { id: uuidv4(), name: '', quantityKg: 0, rate: 0 }]);
  };

  const handleRemoveCommodity = (id: string) => {
    if (commodities.length > 1) {
      setCommodities(commodities.filter(c => c.id !== id));
    }
  };

  const handleCommodityChange = (id: string, field: keyof QuotationCommodity, value: string | number) => {
    setCommodities(commodities.map(c => {
      if (c.id === id) {
        const parsedValue = (field === 'quantityKg' || field === 'rate') ? parseFloat(value as string) || 0 : value;
        return { ...c, [field]: parsedValue };
      }
      return c;
    }));
  };

  const handleCreateQuotation = () => {
    if (!newQuotation.clientName || clientQuoteTotal <= 0 || !newQuotation.buyRate || !newQuotation.quoteSentBy) {
      toast({
        title: "Missing Fields",
        description: "Please fill in client, commodities, buy rate, and sender details.",
        variant: "destructive",
      });
      return;
    }

    const newQuotationData: Quotation = {
      id: `q${Date.now()}`,
      clientName: newQuotation.clientName,
      volume: JSON.stringify(commodities), // Serialize commodities
      currency: newQuotation.currency,
      buyRate: parseFloat(newQuotation.buyRate),
      clientQuote: clientQuoteTotal,
      profit: calculatedProfit.profit,
      profitPercentage: calculatedProfit.profitPercentage,
      quoteSentBy: newQuotation.quoteSentBy,
      status: 'pending',
      followUpDate: newQuotation.followUpDate,
      remarks: newQuotation.remarks,
      createdAt: new Date().toISOString(),
      destination: newQuotation.destination,
      doorDelivery: newQuotation.doorDelivery,
    };
    
    onQuotationCreated(newQuotationData);
    setNewQuotation(initialQuotationState);
    setCommodities([{ id: uuidv4(), name: '', quantityKg: 0, rate: 0 }]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Create New Quotation</h2>
      <Card>
        <CardHeader>
          <CardTitle>Quotation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <QuotationFormDetails
            quotationData={newQuotation}
            onQuotationChange={handleNewQuotationChange}
            onCurrencyChange={handleCurrencyChange}
          />
          
          <CommodityList
            commodities={commodities}
            onAddCommodity={handleAddCommodity}
            onRemoveCommodity={handleRemoveCommodity}
            onCommodityChange={handleCommodityChange}
          />
          
          <QuotationSummary
            quotationData={newQuotation}
            clientQuoteTotal={clientQuoteTotal}
            calculatedProfit={calculatedProfit}
            onQuotationChange={handleNewQuotationChange}
          />
          
          <Button className="w-full" onClick={handleCreateQuotation}>
            <Plus size={16} className="mr-2" />
            Create Quotation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateQuotationView;
