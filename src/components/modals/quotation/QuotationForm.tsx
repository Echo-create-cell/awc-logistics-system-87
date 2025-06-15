import React, { useState, useEffect } from 'react';
import { Quotation, Client } from '@/types';
import { QuotationCommodity, InvoiceCharge } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { mockClients } from '@/data/mockData';
import CommodityList from '../../quotations/CommodityList';
import QuotationSummary from '../../quotations/QuotationSummary';
import QuotationFormDetails from '../../quotations/QuotationFormDetails';
import { Button } from '@/components/ui/button';

interface QuotationFormProps {
  quotation: Quotation | null;
  onSave: (quotation: Quotation, isDraft: boolean) => void;
  onClose: () => void;
}

const QuotationForm = ({ quotation, onSave, onClose }: QuotationFormProps) => {
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
    if (quotation) {
      setSelectedClientId(quotation.client_id);
      setClientQuote(quotation.client_quote);
      setRemarks(quotation.remarks);
      setDestination(quotation.destination);
      setDoorDelivery(quotation.doorDelivery || '');
      setCurrency(quotation.currency);

      try {
        const parsed = JSON.parse(quotation.volume);
        if (Array.isArray(parsed)) {
            const commoditiesWithCharges = parsed.map((c: any) => {
                if (c.rate !== undefined && !c.charges) {
                    return {
                        ...c,
                        id: c.id || uuidv4(),
                        charges: [{ id: uuidv4(), description: `Charge for ${c.name}`, rate: c.rate }],
                    };
                }
                return {...c, id: c.id || uuidv4(), charges: c.charges || [{ id: uuidv4(), description: '', rate: 0 }] };
            });
            setCommodities(commoditiesWithCharges);
        }
      } catch (e) {
        console.error("Failed to parse commodities from quotation volume", e);
        setCommodities([]);
      }
    } else {
      addCommodity();
    }
  }, [quotation]);

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
  
  const handleSave = (isDraft: boolean) => {
    onSave({
      client_id: selectedClientId || '',
      client_quote: clientQuote,
      remarks,
      destination,
      doorDelivery,
      currency,
      volume: JSON.stringify(commodities),
      status: 'pending',
    }, isDraft);
  };

  return (
    <div className="space-y-6 p-1">
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
                    <Button onClick={addCommodody} variant="outline" className="mt-4">
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
        <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => handleSave(true)}>Save as Draft</Button>
            <Button onClick={() => handleSave(false)}>Submit for Approval</Button>
        </div>
    </div>
  );
};

export default QuotationForm;
