import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Quotation, Client } from '@/types';
import { QuotationCommodity, InvoiceCharge } from '@/types/invoice';
import { useAuth } from '@/contexts/AuthContext';
import CommodityList from '../quotations/CommodityList';
import { mockClients } from '@/data/mockData';
import QuotationSummary from '../quotations/QuotationSummary';
import QuotationActions from '../quotations/QuotationActions';
import QuotationFormDetails from '../quotations/QuotationFormDetails';

interface CreateQuotationViewProps {
  onSave: (quotation: Omit<Quotation, 'id' | 'status' | 'created_at' | 'quote_sent_by' | 'approved_by' | 'approved_at'>, isDraft: boolean) => void;
  setActiveTab: (tab: string) => void;
}

const CreateQuotationView = ({ onSave, setActiveTab }: CreateQuotationViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [commodities, setCommodities] = useState<QuotationCommodity[]>([]);
  const [buyRate, setBuyRate] = useState(0);
  const [clientQuote, setClientQuote] = useState(0);
  const [profit, setProfit] = useState(0);
  const [profitPercentage, setProfitPercentage] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [destination, setDestination] = useState('');
  const [doorDelivery, setDoorDelivery] = useState('');
  const [currency, setCurrency] = useState('USD');
  
  useEffect(() => {
    addCommodity();
  }, []);

  const addCommodity = () => {
    const newCommodity: QuotationCommodity = {
      id: uuidv4(),
      name: '',
      quantityKg: 0,
      charges: [{ id: uuidv4(), description: '', rate: 0 }]
    };
    setCommodities([...commodities, newCommodity]);
  };

  const removeCommodity = (id: string) => {
    if (commodities.length > 1) {
      setCommodities(commodities.filter(c => c.id !== id));
    }
  };

  const updateCommodity = (id: string, field: 'name' | 'quantityKg', value: string | number) => {
    setCommodities(commodities.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };
  
  const addCharge = (commodityId: string) => {
    setCommodities(commodities.map(c => {
      if (c.id === commodityId) {
        const newCharge: InvoiceCharge = { id: uuidv4(), description: '', rate: 0 };
        return { ...c, charges: [...c.charges, newCharge] };
      }
      return c;
    }));
  };

  const removeCharge = (commodityId: string, chargeId: string) => {
    setCommodities(commodities.map(c => {
      if (c.id === commodityId) {
        if (c.charges.length > 1) {
          return { ...c, charges: c.charges.filter(charge => charge.id !== chargeId) };
        }
      }
      return c;
    }));
  };
  
  const updateCharge = (commodityId: string, chargeId: string, field: keyof Omit<InvoiceCharge, 'id'>, value: string | number) => {
    setCommodities(commodities.map(c => {
      if (c.id === commodityId) {
        return {
          ...c,
          charges: c.charges.map(charge =>
            charge.id === chargeId ? { ...charge, [field]: value } : charge
          )
        };
      }
      return c;
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [commodities, clientQuote]);

  const calculateTotals = () => {
    const totalBuyRate = commodities.reduce((sum, commodity) => {
      const commodityRate = commodity.charges.reduce((chargeSum, charge) => chargeSum + (Number(charge.rate) || 0), 0);
      const quantity = Number(commodity.quantityKg) || 0;
      return sum + (commodityRate * quantity);
    }, 0);
    setBuyRate(totalBuyRate);
    
    const p = (clientQuote || 0) - totalBuyRate;
    const pp = totalBuyRate > 0 ? (p / totalBuyRate) * 100 : 0;
    setProfit(p);
    setProfitPercentage(pp);
  };
  
  const handleSaveQuotation = (isDraft: boolean) => {
    if (!selectedClientId || clientQuote <= 0 || !buyRate || !currency) {
      toast({
        title: "Missing Fields",
        description: "Please select a client, fill in commodities, buy rate, and currency.",
        variant: "destructive",
      });
      return;
    }

    const newQuotationData: Omit<Quotation, 'id' | 'status' | 'created_at' | 'quote_sent_by' | 'approved_by' | 'approved_at'> = {
      clientName: selectedClientId,
      volume: JSON.stringify(commodities), // Serialize commodities
      currency,
      buyRate,
      clientQuote,
      profit,
      profitPercentage,
      remarks,
      destination,
      doorDelivery,
      // New fields from Excel
      freightMode: 'Air Freight' as Quotation['freightMode'],
      requestType: 'Import' as Quotation['requestType'],
      countryOfOrigin: '',
      cargoDescription: '',
    };
    
    onSave(newQuotationData, isDraft);
    setCommodities([{ id: uuidv4(), name: '', quantityKg: 0, rate: 0 }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Create New Quotation</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <QuotationFormDetails
            clients={clients}
            selectedClientId={selectedClientId}
            onClientChange={setSelectedClientId}
            destination={destination}
            onDestinationChange={setDestination}
            doorDelivery={doorDelivery}
            onDoorDeliveryChange={setDoorDelivery}
            currency={currency}
            onCurrencyChange={setCurrency}
          />

          <div>
            <h3 className="text-lg font-semibold mb-2">Commodities</h3>
            <CommodityList
              commodities={commodities}
              onUpdateCommodity={updateCommodity}
              onRemoveCommodity={removeCommodity}
              onAddCharge={addCharge}
              onRemoveCharge={removeCharge}
              onUpdateCharge={updateCharge}
              currency={currency}
            />
            <Button onClick={addCommodity} variant="outline" className="mt-4">
              Add Another Commodity
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <QuotationSummary
            buyRate={buyRate}
            clientQuote={clientQuote}
            onClientQuoteChange={setClientQuote}
            profit={profit}
            profitPercentage={profitPercentage}
            currency={currency}
            remarks={remarks}
            onRemarksChange={setRemarks}
          />
        </div>
      </div>
      
      <QuotationActions
        onSave={handleSaveQuotation}
        onCancel={() => setActiveTab("allQuotations")}
      />
    </div>
  );
};

export default CreateQuotationView;
